import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import {PowerBIReport, TokenInfo} from './PowerBIReport';
import * as pbimodels from "powerbi-models";

interface PowerBILoaderState {
    tokenInfo?: TokenInfo,
    loading: boolean
}

export class PowerBILoader extends React.Component<RouteComponentProps<{}>, PowerBILoaderState> {
    constructor(props: any) {
        super(props);
        this.state = {tokenInfo: undefined, loading: true};
        fetch('api/PowerBI/GetToken')
            .then(response => response.json() as Promise<TokenInfo>)
            .then(data => {
                this.setState({ tokenInfo: data, loading: false });
            });
    }
    public render() {
        console.log(this.state);
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : PowerBILoader.renderContainer(this.state.tokenInfo);
        return contents;
    }
    private static renderContainer(tokenInfo?: TokenInfo) {
        return (
            <PowerBIReport {...tokenInfo}
                type = 'report'
                permissions = {pbimodels.Permissions.All}
                tokenType = {pbimodels.TokenType.Embed}
            />
        )
    }
    getInitialState():PowerBILoaderState {
        return ({tokenInfo: undefined, loading: true});
    }
}
