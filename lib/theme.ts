export function theme(
  focusBgColor: string | null,
  backgroundColor: string | null
) {
  return {
    root: {
      primaryColor: "rgb(8 117 225)",
      dangerColor: "salmon",
      warningColor: "yellow",
    },
    sidebar: {
      logo: `https://images.ctfassets.net/e8fqfbar73se/4c9ouGKgET1qfA4uxp4qLZ/e3f1a8b31be67a798c1e49880581fd3d/white-logo-w-padding.png`,
      textColor: "white",
      titleColor: "white",
      focusBgColor: focusBgColor,
      focusTextColor: "white",
      backgroundColor: backgroundColor,
      footerTextColor: "white",
      textUltralightColor: "red",
    },
    table: {
      inputs: {
        radio: {
          color: "rgb(8 117 225)",
        },
        checkbox: {
          color: "rgb(8 117 225)",
        },
      },
      filters: {
        color: "gray",
        active: {
          backgroundColor: "rgb(8 117 225)",
        },
        error: {
          activeBackgroundColor: "salmon",
        },
      },
      column: {
        header: {
          fontSize: "12px",
          backgroundColor: "rgb(240 240 240)",
          color: "slategray",
          dragHandle: {
            idle: "rgb(8 117 225)",
            dragging: "blue",
          },
        },
      },
      fontFamily: "Arial",
      indexColumn: {
        backgroundColor: "rgb(240 240 240)",
        selected: {
          color: "rgb(240 240 240)",
          backgroundColor: "rgb(200 200 200)",
        },
      },
      cell: {
        selected: {
          backgroundColor: "rgb(235 245 255)",
        },
        active: {
          borderColor: "rgb(8 117 225)",
          spinnerColor: "gray",
        },
      },
      boolean: {
        toggleChecked: "rgb(240 240 240)",
      },
      loading: {
        color: "rgb(240 240 240)",
      },
    },
  };
}
