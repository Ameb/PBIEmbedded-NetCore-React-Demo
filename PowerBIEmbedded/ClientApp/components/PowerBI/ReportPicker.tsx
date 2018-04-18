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
    private renderContainer() {
        if (!this.state.reports) return;
        function ReportLine(report: Report) {
            return (
                <li className="list-group-item" key={report.id}>{report.name}</li>
            )
        }
        return (
            <div className="col-md-6">
                <ul className="list-group">
                    {this.state.reports.map(report => <ReportLine {...report} />)}
                </ul>
            </div>
        )
    }
}
