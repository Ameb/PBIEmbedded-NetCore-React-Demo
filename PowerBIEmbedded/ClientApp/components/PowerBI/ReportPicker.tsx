import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import * as pbimodels from "powerbi-models";
import {TokenInfo} from '../PowerBIReport';
import {PowerBILoader} from '../PowerBILoader';
import $ from 'jquery';


interface ReportPickerProps {
    masterUser?: string,
    ADcode?: string,
}

interface ReportPickerState {
    reports?: TokenInfo[],
    loading: boolean,
    selectedReport?: TokenInfo,
    selectedMode?: ReportActions
}

enum ReportActions {
    View = 'View',
    Edit = 'Edit'
}

export class ReportPicker extends React.Component<ReportPickerProps, ReportPickerState> {
    constructor(props: any) {
        super(props);
        this.state = {reports: undefined, loading: true};
        this.updateData();
        this.handleReportAction = this.handleReportAction.bind(this);
    }
    private updateData() {
        let params = {
            masterUser: this.props.masterUser ? this.props.masterUser : '',
            ADcode: this.props.ADcode ? this.props.ADcode : '',
        };
        let url = `api/PowerBI/GetReportList\?${$.param(params)}`;
        fetch(url)
            .then(response => response.json() as Promise<TokenInfo[]>)
            .then(data => {
                this.setState({ reports: data, loading: false});
            });
    }
    public render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : this.renderContainer();
        return contents;
    }
    private handleReportAction(report: TokenInfo, action: ReportActions) {
        this.setState({selectedReport: report, selectedMode: action});
    }
    private renderContainer() {
        if (!this.state.reports) return;
        const ReportLine = (report: TokenInfo, onclick: Function, selectedReport: Function ) => (
                <tr className={report.id == selectedReport()? 'table-active': 'table'} key={report.id}>
                    <td>
                        {report.name}
                        <div className="btn-group-sm pull-right" role="group">
                            <button type="button" className=" btn btn-sm btn-default" onClick={() => onclick(report, ReportActions.View)}>
                                <span className="glyphicon glyphicon glyphicon-eye-open"></span>
                            </button>
                            <button type="button" className="btn btn-sm btn-default" onClick={() => onclick(report, ReportActions.Edit)}>
                                <span className="glyphicon glyphicon-pencil"></span>
                            </button>
                        </div>
                    </td>
                </tr>
        )
        return (
            <div className="">
                <table className="table table-hover table-sm">
                <thead>
                    <tr>
                        <th>Lista de reports</th>
                    </tr>
                </thead>
                    <tbody>
                        {this.state.reports.map(report => ReportLine(report, this.handleReportAction, () => this.state.selectedReport))}
                    </tbody>
                </table>
                {this.state.selectedReport && <PowerBILoader report={this.state.selectedReport} mode={this.state.selectedMode} masterUser={this.props.masterUser} ADcode={this.props.ADcode}/>}
            </div>
        )
    }
}
