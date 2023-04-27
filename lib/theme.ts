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
      // TODO: White Logo needs to be added on the config side, then the logo can be removed from here
      logo: `http://localhost:3000/images/white-logo.png`,
      // logo: "https://images.ctfassets.net/hjneo4qi4goj/gL6Blz3kTPdZXWknuIDVx/7bb7c73d93b111ed542d2ed426b42fd5/flatfile.svg",
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
