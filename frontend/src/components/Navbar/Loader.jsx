import React from "react";
import { Box, CircularProgress, Backdrop, Typography } from "@mui/material";

export default function Loader({
  size = 40,
  thickness = 4,
  color = "primary",
  message = "",
  variant = "inline",
  fullscreen = false,
  sx = {},
}) {
  const isOverlay = variant === "overlay" || fullscreen;

  if (isOverlay) {
    return (
      <Backdrop
        open
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "rgba(0,0,0,0.55)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          ...sx,
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <CircularProgress
            size={Math.max(size, 40)}
            thickness={thickness}
            color={color}
          />
          {message ? (
            <Typography variant="body1" sx={{ mt: 1 }}>
              {message}
            </Typography>
          ) : null}
        </Box>
      </Backdrop>
    );
  }

  return (
    <Box display="inline-flex" alignItems="center" gap={1} sx={sx}>
      <CircularProgress size={size} thickness={thickness} color={color} />
      {message ? <Typography variant="body2">{message}</Typography> : null}
    </Box>
  );
}
