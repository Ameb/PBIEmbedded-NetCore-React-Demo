import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import {PowerBIReport, TokenInfo} from './PowerBIReport';

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
        if (!tokenInfo) return <div></div>;
        return (
            <PowerBIReport
                EmbedToken = {tokenInfo.EmbedToken}
                EmbedUrl = {tokenInfo.EmbedUrl}
                ReportId = {tokenInfo.ReportId}
                mode ={tokenInfo.mode}
            />
        )
    }
    getInitialState():PowerBILoaderState {
        return ({tokenInfo: undefined, loading: true});
    }
}
