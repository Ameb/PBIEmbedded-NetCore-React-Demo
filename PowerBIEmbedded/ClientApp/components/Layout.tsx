import * as React from 'react';
import { NavMenu } from './NavMenu';
import { ContextCode, IContextCode } from "../context";

export interface LayoutProps {
    children?: React.ReactNode;
}
interface LayoutState extends IContextCode {
    mode: string
}

export class Layout extends React.Component<LayoutProps, LayoutState> {
    private extractCode: (newcode: string) => void;
    public constructor(props: any) {
        super(props);
        this.extractCode = (qs:string): void => {
            console.log(qs, this.state.code);
            if (this.state.code && !qs) {
                this.setState({code: '', mode: 'normal'});
            } else {
                var newcode = qs.substring(6);
                if (!this.state.code && newcode) {
                    this.setState({code: newcode, mode: 'AD'});
                }
            }
        };
        this.state = {
            code: '',
            changeCode: this.extractCode,
            mode: 'normal'
        };
    }
    public render() {
        return <div className='container-fluid'>
            <ContextCode.Provider value={this.state}>
            <div className='row'>
                <div className='col-sm-3'>
                    <NavMenu />
                </div>
                <div className='col-sm-9'>
                    <div> modo: {this.state.mode} </div>
                    { this.props.children }
                </div>
            </div>
            </ContextCode.Provider>
        </div>;
    }
}
