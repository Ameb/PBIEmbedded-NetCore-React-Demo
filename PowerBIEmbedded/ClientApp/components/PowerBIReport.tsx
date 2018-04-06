import * as React from 'react';
import * as pbi from 'powerbi-client';

export interface TokenInfo extends pbi.IEmbedConfiguration {
    reportId?: string,
    mode?: string
}

export class PowerBIReport extends React.Component<TokenInfo, {}> {
    private powerbi: pbi.service.Service;
    private ref: HTMLDivElement;
    constructor(props: TokenInfo) {
        super(props);
        this.powerbi = new pbi.service.Service(pbi.factories.hpmFactory, pbi.factories.wpmpFactory, pbi.factories.routerFactory);
    }
    public render() {
        return (
            <div>
                <div className="embedContainer" ref={(div) => { if (div) {this.ref = div; }}}></div>
                <div>
                Token: <pre>{this.props.accessToken}</pre>
                Url: <pre>{this.props.embedUrl}</pre>
                id: <pre>{this.props.id}</pre>
                type: <pre>{this.props.type}</pre>
                mode: <pre>{this.props.mode}</pre>
                </div>
            </div>
        )
    }
    componentDidMount() {
        this.powerbi.embed(this.ref, this.props);
    }
}
