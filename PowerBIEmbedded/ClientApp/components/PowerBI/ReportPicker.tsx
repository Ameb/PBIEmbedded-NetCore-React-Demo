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

export class ReportPicker extends React.Component<RouteComponentProps<{}>, ReportPickerState> {
    constructor(props: any) {
        super(props);
        this.state = {reports: undefined, loading: true};
        this.updateData();
        this.handleEdit = this.handleEdit.bind(this);
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
    private handleEdit(reportId: String) {
        console.log(reportId);
    }
    private renderContainer() {
        if (!this.state.reports) return;
        const ReportLine = (report: Report, onclick: Function) => (
                <a className="list-group-item" key={report.id}>{report.name} <a onClick={() => onclick(report.id)} className="pull-right"><span className="glyphicon glyphicon-pencil"></span></a></a>
            )
        return (
            <div className=" col-md-6">
                <div className="list-group">
                    {this.state.reports.map(report => ReportLine(report, this.handleEdit))}
                </div>
            </div>
        )
    }
}
