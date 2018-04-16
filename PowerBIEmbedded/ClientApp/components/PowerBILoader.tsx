import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import {PowerBIReport, TokenInfo} from './PowerBIReport';
import * as pbimodels from "powerbi-models";

interface PowerBILoaderState {
    tokenInfo?: TokenInfo,
    loading: boolean,
    user: string
}

export class PowerBILoader extends React.Component<RouteComponentProps<{}>, PowerBILoaderState> {
    constructor(props: any) {
        super(props);
        this.state = {tokenInfo: undefined, loading: true, user: ''};
        this.updateData();
        this.toggleEditMode = this.toggleEditMode.bind(this);
        this.changeUser = this.changeUser.bind(this);
    }
    private updateData(mode?: pbimodels.ViewMode, user: string = this.state.user) {
        let url = `\
api/PowerBI/GetToken\
${mode == pbimodels.ViewMode.Edit ? '?mode=Edit' : ''}\
${user ? `?user=${user}` : ''}`;
        fetch(url)
            .then(response => response.json() as Promise<TokenInfo>)
            .then(data => {
                if (data.mode == "Edit") data.viewMode = pbimodels.ViewMode.Edit
                else if (data.mode == "View") data.viewMode = pbimodels.ViewMode.View;
                this.setState({ tokenInfo: data, loading: false, user: user});
            });
    }
    private toggleEditMode() {
        if (!this.state.tokenInfo) return
        if (this.state.tokenInfo.viewMode == pbimodels.ViewMode.Edit)
            this.updateData(pbimodels.ViewMode.View);
        else
            this.updateData(pbimodels.ViewMode.Edit)
    }
    private changeUser(e: React.FormEvent<HTMLSelectElement>) {
        if (!this.state.tokenInfo) return
        console.log(e)
        this.updateData(this.state.tokenInfo.viewMode, e.currentTarget.value);
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
                <select name="user" onChange={this.changeUser} value={this.state.user}>
                <option value="">ibr</option>
                <option value="bitest1">bitest1</option>
                <option value="bitest2">bitest2</option>
                </select>
                <PowerBIReport {...this.state.tokenInfo}
                    type = 'report'
                    permissions = {pbimodels.Permissions.All}
                    tokenType = {pbimodels.TokenType.Embed}
                />
            </div>
        )
    }
}
