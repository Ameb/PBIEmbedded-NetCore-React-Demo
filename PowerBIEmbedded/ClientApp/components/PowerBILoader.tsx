import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import {PowerBIReport, TokenInfo} from './PowerBIReport';
import * as pbimodels from "powerbi-models";

interface PowerBILoaderState {
    tokenInfo?: TokenInfo,
    loading: boolean,
    user: string,
    mode: string
}

export class PowerBILoader extends React.Component<RouteComponentProps<{}>, PowerBILoaderState> {
    constructor(props: any) {
        super(props);
        this.state = {tokenInfo: undefined, loading: true, user: '', mode: 'Create'};
        this.updateData();
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
    }
    private updateData() {
        const mode = this.state.mode;
        const user = this.state.user;
        let url = `api/PowerBI/GetToken\?mode=${mode}${user ? `&user=${user}` : ''}`;
        fetch(url)
            .then(response => response.json() as Promise<TokenInfo>)
            .then(data => {
                if (data.mode == "Edit") data.viewMode = pbimodels.ViewMode.Edit
                else if (data.mode == "View") data.viewMode = pbimodels.ViewMode.View;
                this.setState({ tokenInfo: data, loading: false, user: user});
            });
    }
    private handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        this.updateData();
    }
    private handleSelectChange(event: React.FormEvent<HTMLSelectElement>) {
        const name = event.currentTarget.name;
        const value = event.currentTarget.value;
        this.setState({[name as any]: value});
      }
    public render() {
        console.log(this.state);
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : this.renderContainer();
        return contents;
    }
    private renderContainer() {
        if (!this.state.tokenInfo) return;
        let reportProps: TokenInfo = {...this.state.tokenInfo};
        if (this.state.mode == "Create") {
            delete(reportProps.reportId);
            delete(reportProps.id);
        } else {
            reportProps.permissions = pbimodels.Permissions.All;
        }
        reportProps.tokenType = pbimodels.TokenType.Embed;
        reportProps.type = 'report';
        //delete(reportProps.mode);

        return (
            <div>
                <form onSubmit = {this.handleSubmit}>
                    <select name="mode" value={this.state.mode} onChange={this.handleSelectChange}>
                        <option value="View">View</option>
                        <option value="Edit">Edit</option>
                        <option value="Create">Create</option>
                    </select>
                    <select name="user" value={this.state.user} onChange={this.handleSelectChange}>
                        <option value="">ibr</option>
                        <option value="bitest1">bitest1</option>
                        <option value="bitest2">bitest2</option>
                    </select>
                    <button type="submit">OK</button>
                </form>
                <PowerBIReport {...reportProps}/>
            </div>
        )
    }
}
