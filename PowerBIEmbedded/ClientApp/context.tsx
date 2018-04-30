import * as React from 'react';
import { RouteComponentProps } from "react-router-dom";
export interface IContextCode {
    code: string,
    changeCode: any
}
export const ContextCode: React.Context<IContextCode> = React.createContext({code: '', changeCode: () => {}});
