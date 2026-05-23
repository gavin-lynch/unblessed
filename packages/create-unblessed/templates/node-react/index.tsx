import { Screen } from "@gavin-lynch/unblessed-node";
import { Box, render, Text } from "@gavin-lynch/unblessed-react";

const screen = new Screen();

const App = () => (
  <Box>
    <Text>Hello World</Text>
  </Box>
);

render(<App />, screen);
