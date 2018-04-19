import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import * as pbimodels from "powerbi-models";

interface ReportPickerState {
    reports?: Report[],
    loading: boolean
}
interface Report {
    id: string,
    name: string,
    webUrl: string,
    embedUrl: string,
    datasetId: string
}
enum ReportActions {
    View,
    Edit
}

export class ReportPicker extends React.Component<RouteComponentProps<{}>, ReportPickerState> {
    constructor(props: any) {
        super(props);
        this.state = {reports: undefined, loading: true};
        this.updateData();
        this.handleReportAction = this.handleReportAction.bind(this);
    }
    private updateData() {
        let url = 'api/PowerBI/GetReportList';
        fetch(url)
            .then(response => response.json() as Promise<Report[]>)
            .then(data => {
                this.setState({ reports: data, loading: false});
            });
    }
    public render() {
        console.log(this.state);
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : this.renderContainer();
        return contents;
    }
    private handleReportAction(reportId: String, action: ReportActions) {
        console.log(reportId);
    }
    private renderContainer() {
        if (!this.state.reports) return;
        const ReportLine = (report: Report, onclick: Function) => (
                <tr className="" key={report.id}>
                    <td>
                        {report.name}
                        <div className="btn-group-sm pull-right" role="group">
                            <button type="button" className=" btn btn-sm btn-default" onClick={() => onclick(report.id, ReportActions.View)}>
                                <span className="glyphicon glyphicon glyphicon-eye-open"></span>
                            </button>
                            <button type="button" className="btn btn-sm btn-default" onClick={() => onclick(report.id, ReportActions.Edit)}>
                                <span className="glyphicon glyphicon-pencil"></span>
                            </button>
                        </div>
                    </td>
                </tr>
        )
        return (
            <div className=" col-md-6">
                <table className="table table-hover table-sm">
                <thead>
                    <tr>
                        <th>Lista de reports</th>
                    </tr>
                </thead>
                    <tbody>
                        {this.state.reports.map(report => ReportLine(report, this.handleReportAction))}
                    </tbody>
                </table>
            </div>
        )
    }
}
