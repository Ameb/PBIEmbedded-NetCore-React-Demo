import * as React from 'react';
import * as pbi from 'powerbi-client';
import * as pbimodels from "powerbi-models";

export interface TokenInfo extends pbi.IEmbedConfiguration {
    reportId?: string,
    mode?: string,
    name?: string,
}

export class PowerBIReport extends React.Component<TokenInfo, {}> {
    private powerbi: pbi.service.Service;
    private ref: React.RefObject<HTMLDivElement>;
    private report? : pbi.Report;
    constructor(props: TokenInfo) {
        super(props);
        this.powerbi = new pbi.service.Service(pbi.factories.hpmFactory, pbi.factories.wpmpFactory, pbi.factories.routerFactory);
        this.ref = React.createRef();
    }
    public render() {
        return (
            <div>
                <div className="embedContainer" ref={this.ref}></div>
                <div>
                Token: <pre>{this.props.accessToken}</pre>
                Url: <pre>{this.props.embedUrl}</pre>
                id: <pre>{this.props.id}</pre>
                type: <pre>{this.props.type}</pre>
                mode: <pre>{this.props.mode} ({this.props.viewMode})</pre>
                </div>
            </div>
        )
    }
    private embed() {
        if (!this.ref.current) return;
        let reportProps: TokenInfo = {...this.props} as TokenInfo;
        reportProps.tokenType = pbimodels.TokenType.Embed;
        reportProps.type = 'report';
        if (this.props.mode == "Create") {
            delete(reportProps.reportId);
            delete(reportProps.id);
            //AD
            let config: TokenInfo = {
                accessToken: reportProps.accessToken,
                type: 'report',
                embedUrl: reportProps.embedUrl
            }
            console.log(reportProps);
            this.report = this.powerbi.createReport(this.ref.current, config) as pbi.Report;
        } else {
            let config: TokenInfo = {
                accessToken: reportProps.accessToken,
                type: 'report',
                embedUrl: reportProps.embedUrl
            }
            reportProps.permissions = pbimodels.Permissions.All;
            console.log(reportProps);
            this.report = new pbi.Report(this.powerbi, this.ref.current, config);
        }
    }
    componentDidMount() {
        this.embed();
    }
    componentDidUpdate(prevProps: TokenInfo) {
        if (this.props.accessToken != prevProps.accessToken)
            this.embed();
        // change from view to edit mode
        if (this.report && this.props.viewMode && prevProps.viewMode != this.props.viewMode) {
                this.report.switchMode(this.props.viewMode);
        }
    }
}
