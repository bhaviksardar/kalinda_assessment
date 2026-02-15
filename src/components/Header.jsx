import { Typography, Button, Stack } from "@mui/material";

export default function Header({ onRefresh }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      className="mb-6"
    >
      <Typography variant="h4" fontWeight="bold">
        Restaurant Dashboard
      </Typography>
    </Stack>
  );
}
