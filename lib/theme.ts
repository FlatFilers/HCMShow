export function theme(color: string) {
  return {
    root: {
      primaryColor: "rgb(8 117 225)",
      dangerColor: "salmon",
      warningColor: "yellow",
    },
    sidebar: {
      logo: "https://images.ctfassets.net/hjneo4qi4goj/gL6Blz3kTPdZXWknuIDVx/7bb7c73d93b111ed542d2ed426b42fd5/flatfile.svg",
      textColor: "white",
      titleColor: color,
      focusBgColor: "white",
      focusTextColor: "rgb(8 117 225)",
      backgroundColor: "rgb(8 117 225)",
      footerTextColor: "white",
      textUltralightColor: "blue",
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
