import * as React from 'react';
import { RouteComponentProps } from "react-router-dom";
export interface IContextCode {
    code: string,
    changeCode: any
}
export const ContextCode: React.Context<IContextCode> = React.createContext({code: '', changeCode: () => {}});

// wrap context around a component
export const withContext = (UnwrappedComponent: React.ComponentType<any>) =>
    class WithCode extends React.Component<any> {
      render() {
        return (
            <ContextCode.Consumer>
                {({code, changeCode}) => <UnwrappedComponent {...this.props} ADcode={code}/>}
            </ContextCode.Consumer>
        );
      }
    };
