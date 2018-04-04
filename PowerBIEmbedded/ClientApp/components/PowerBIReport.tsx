import * as React from 'react';
import { RouteComponentProps } from 'react-router';

export interface TokenInfo {
    EmbedToken: string,
    EmbedUrl: string,
    ReportId: string,
    mode: string
}

export class PowerBIReport extends React.Component<TokenInfo, {}> {
    contructor() {
    }
    public render() {
        return (
            <div>
                <div id='embedContainer'></div>
                Token: <pre>{this.props.EmbedToken}</pre>
                Url: <pre>{this.props.EmbedUrl}</pre>
                ReportId: <pre>{this.props.ReportId}</pre>
                Mode: <pre>{this.props.mode}</pre>
            </div>
        )
    }
}
