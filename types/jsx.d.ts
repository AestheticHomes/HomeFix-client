// ./types/global.d.ts (Recommended new file name)

// Augment the React module to add the custom elements to JSX.IntrinsicElements
declare module "react" {
  interface HTMLAttributes<T> {
    // Add custom HTML attributes if you need to pass unknown props
    [key: string]: any;
  }
}

// Augment the global JSX namespace for custom web components
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "gmpx-place-autocomplete": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        placeholder?: string;
        version?: string;
        style?: React.CSSProperties;
        // Adding ref is optional but good practice
        ref?: React.Ref<any>;
      };
    }
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "gmpx-place-autocomplete": React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement>,
          HTMLElement
        > & {
          placeholder?: string;
          version?: string;
          style?: React.CSSProperties;
          ref?: React.Ref<any>;
        };
      }
    }
  }
}

export {}; // Make this file a module so 'declare global' works
declare namespace React {
  interface DetailedHTMLProps<E extends HTMLAttributes<T>, T> { [key: string]: any }
}
