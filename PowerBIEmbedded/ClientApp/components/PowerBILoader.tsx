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
        this.updateData();
        this.toggleEditMode = this.toggleEditMode.bind(this);
    }
    private updateData(mode?: pbimodels.ViewMode) {
        let url = 'api/PowerBI/GetToken';
        if (mode == pbimodels.ViewMode.Edit) {
            url = `${url}?mode=Edit`
        }
        fetch(url)
            .then(response => response.json() as Promise<TokenInfo>)
            .then(data => {
                if (data.mode == "Edit") data.viewMode = pbimodels.ViewMode.Edit
                else if (data.mode == "View") data.viewMode = pbimodels.ViewMode.View;
                this.setState({ tokenInfo: data, loading: false});
            });
    }
    private toggleEditMode() {
        if (!this.state.tokenInfo) return
        if (this.state.tokenInfo.viewMode == pbimodels.ViewMode.Edit)
            this.updateData(pbimodels.ViewMode.View);
        else
            this.updateData(pbimodels.ViewMode.Edit)
    }
    public render() {
        console.log(this.state);
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : this.renderContainer();
        return contents;
    }
    private renderContainer() {
        return (
            <div>
                <button onClick={this.toggleEditMode}>{this.state.tokenInfo && this.state.tokenInfo.viewMode == pbimodels.ViewMode.Edit ? 'Cambiar a modo Lectura': 'Cambiar a modo edición'}</button>
                <PowerBIReport {...this.state.tokenInfo}
                    type = 'report'
                    permissions = {pbimodels.Permissions.All}
                    tokenType = {pbimodels.TokenType.Embed}
                />
            </div>
        )
    }
    getInitialState():PowerBILoaderState {
        return ({tokenInfo: undefined, loading: true});
    }
}
