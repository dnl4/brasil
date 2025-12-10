declare module 'flix-component/packages/snackbar/src' {
  import { ReactNode } from 'react';
  
  export interface SnackbarProviderProps {
    children: ReactNode;
  }
  
  export function SnackbarProvider(props: SnackbarProviderProps): JSX.Element;
  
  export interface ShowOptions {
    backgroundColor?: string;
    label?: string;
    onPress?: () => void;
  }
  
  export interface UseSnackbarReturn {
    show: (message: string, options?: ShowOptions) => void;
    hide: () => void;
  }
  
  export function useSnackbar(): UseSnackbarReturn;
}
