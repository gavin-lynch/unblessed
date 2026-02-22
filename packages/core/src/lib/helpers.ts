/**
 * helpers.ts - helpers for blessed
 */

/**
 * Modules
 */

import { getRuntime, Runtime } from "../runtime-context";
import unicode from "./unicode.js";

/**
 * Helpers
 */

const helpers: any = {};

helpers.merge = (a: any, b: any): any => {
  Object.keys(b).forEach((key) => {
    a[key] = b[key];
  });
  return a;
};

export function mergeRecursive<T extends object, U extends object>(
  obj1: T | null | undefined,
  obj2: U | null | undefined,
): T & U {
  if (obj1 == null) {
    return obj2 as T & U;
  }
  if (obj2 == null) {
    return obj1 as T & U;
  }

  const result = { ...obj1 } as Record<string, unknown>;

  for (const p in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, p)) {
      try {
        const val = obj2[p as keyof U];
        if (val !== null && typeof val === "object" && !Array.isArray(val)) {
          result[p] = mergeRecursive(result[p] as object | null, val as object);
        } else {
          result[p] = val;
        }
      } catch {
        result[p] = obj2[p as keyof U];
      }
    }
  }

  return result as T & U;
}

export function abbreviateNumber(value: number | string): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (numValue >= 1000) {
    const suffixes = ["", "k", "m", "b", "t"];
    const suffixNum = Math.floor(String(numValue).length / 3);
    let shortValue = "";

    for (let precision = 2; precision >= 1; precision--) {
      shortValue = parseFloat(
        (suffixNum !== 0
          ? numValue / Math.pow(1000, suffixNum)
          : numValue
        ).toPrecision(precision),
      ).toString();

      const dotLessShortValue = shortValue.replace(/[^a-zA-Z0-9]+/g, "");
      if (dotLessShortValue.length <= 2) {
        break;
      }
    }

    return shortValue + suffixes[suffixNum];
  }

  return String(numValue);
}

export function getInnerBoxSize(widget: {
  width: number;
  height: number;
  border?: unknown;
}): { innerWidthChars: number; innerHeightChars: number } {
  const borderSize = widget.border ? 2 : 0;
  return {
    innerWidthChars: Math.max(1, Math.floor(widget.width - borderSize)),
    innerHeightChars: Math.max(1, Math.floor(widget.height - borderSize)),
  };
}

helpers.asort = (obj: any[]): any[] => {
  return obj.sort((a: any, b: any) => {
    a = a.name.toLowerCase();
    b = b.name.toLowerCase();

    if (a[0] === "." && b[0] === ".") {
      a = a[1];
      b = b[1];
    } else {
      a = a[0];
      b = b[0];
    }

    return a > b ? 1 : a < b ? -1 : 0;
  });
};

helpers.hsort = (obj: any[]): any[] => {
  return obj.sort((a: any, b: any) => {
    return b.index - a.index;
  });
};

helpers.findFile = (start: string, target: string): string | null => {
  return (function read(dir: string): string | null {
    let files: string[],
      file: string,
      stat: ReturnType<Runtime["fs"]["lstatSync"]> | null,
      out: string | null;

    if (dir === "/dev" || dir === "/sys" || dir === "/proc" || dir === "/net") {
      return null;
    }

    const runtime = getRuntime();

    try {
      files = runtime.fs.readdirSync(dir);
    } catch (e) {
      files = [];
    }

    for (let i = 0; i < files.length; i++) {
      file = files[i];

      if (file === target) {
        return (dir === "/" ? "" : dir) + "/" + file;
      }

      try {
        stat = runtime.fs.lstatSync((dir === "/" ? "" : dir) + "/" + file);
      } catch (e) {
        stat = null;
      }

      if (stat && stat.isDirectory() && !stat.isSymbolicLink()) {
        out = read((dir === "/" ? "" : dir) + "/" + file);
        if (out) return out;
      }
    }

    return null;
  })(start);
};

// Escape text for tag-enabled elements.
helpers.escape = (text: string): string => {
  return text.replace(/[{}]/g, (ch) => {
    return ch === "{" ? "{open}" : "{close}";
  });
};

helpers.parseTags = (text: string, screen?: any): any => {
  return helpers.Element.prototype._parseTags.call(
    { parseTags: true, screen: screen || helpers.Screen.global },
    text,
  );
};

helpers.generateTags = (style: any, text?: string): any => {
  let open = "";
  let close = "";

  Object.keys(style || {}).forEach((key) => {
    let val = style[key];
    if (typeof val === "string") {
      val = val.replace(/^light(?!-)/, "light-");
      val = val.replace(/^bright(?!-)/, "bright-");
      open = "{" + val + "-" + key + "}" + open;
      close += "{/" + val + "-" + key + "}";
    } else {
      if (val === true) {
        open = "{" + key + "}" + open;
        close += "{/" + key + "}";
      }
    }
  });

  if (text != null) {
    return open + text + close;
  }

  return {
    open: open,
    close: close,
  };
};

helpers.attrToBinary = (style: any, element?: any): any => {
  return helpers.Element.prototype.sattr.call(element || {}, style);
};

helpers.stripTags = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/{(\/?)([\w\-,;!#]*)}/g, "")
    .replace(new RegExp("\\x1b\\[[\\d;]*m", "g"), "");
};

helpers.cleanTags = (text: string): string => {
  return helpers.stripTags(text).trim();
};

helpers.dropUnicode = (text: string): string => {
  if (!text) return "";
  return text
    .split("")
    .map((char: string, _i: number, _arr: string[]) => {
      // Use unicode.replaceWideChars logic inline for better performance with chaining
      const width = unicode.charWidth(char, 0);
      if (width === 2) {
        return "??";
      }
      return char;
    })
    .join("")
    .replace(unicode.chars.combining, "")
    .replace(unicode.chars.surrogate, "?");
};

// Export individual functions for convenience
export const {
  merge,
  asort,
  hsort,
  findFile,
  parseTags,
  generateTags,
  attrToBinary,
  stripTags,
  cleanTags,
  dropUnicode,
} = helpers;

// eslint-disable-next-line no-restricted-globals
const escapeText = helpers.escape;
export { escapeText as escape };

export default helpers;
