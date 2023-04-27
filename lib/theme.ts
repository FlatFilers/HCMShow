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
      logo: `https://drive.google.com/uc?id=171gJ4sQfnYps0XG3dSPFL7SiBXZHmOFv`,
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
