import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import {PowerBIReport, TokenInfo} from './PowerBIReport';
import * as pbimodels from "powerbi-models";

interface PowerBILoaderState {
    tokenInfo?: TokenInfo,
    loading: boolean,
    user: string,
    mode: string,
}
interface PowerBILoaderProps {
    user?: string,
    mode?: string,
    reportId?: string,
}

export class PowerBILoader extends React.Component<PowerBILoaderProps, PowerBILoaderState> {
    constructor(props: PowerBILoaderProps) {
        super(props);
        this.state = {tokenInfo: undefined, loading: true, user: props.user? props.user : '', mode: props.mode? props.mode : 'Create'};
        this.updateData();
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
    }
    private updateData() {
        const mode = this.state.mode;
        const user = this.state.user;
        const id = this.props.reportId;
        let url = `api/PowerBI/GetReportToken\?mode=${mode}${user ? `&user=${user}` : ''}${id ? `&id=${id}` : ''}`;
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
        return (
            <div>
                <form onSubmit = {this.handleSubmit}>
                    <select name="mode" value={this.state.mode} onChange={this.handleSelectChange}>
                        <option value="View">View</option>
                        <option value="Edit">Edit</option>
                        <option value="Create">Create</option>
                    </select>
                    { this.state.mode != "Create" &&
                    <select name="user" value={this.state.user} onChange={this.handleSelectChange}>
                        <option value="">ibr</option>
                        <option value="bitest1">bitest1</option>
                        <option value="bitest2">bitest2</option>
                    </select>
                    }
                    <button type="submit">OK</button>
                </form>
                <PowerBIReport {...this.state.tokenInfo}/>
            </div>
        )
    }
    public componentDidUpdate(prevProps: PowerBILoaderProps, prevState: PowerBILoaderState) {
        if (prevProps != this.props) this.updateData();
    }
}
