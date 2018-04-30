import * as React from 'react';
import { RouteProps } from 'react-router';
import { Route, RouteComponentProps } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { FetchData } from './components/FetchData';
import { Counter } from './components/Counter';
import { PowerBILoader } from './components/PowerBILoader';
import { ReportPicker } from './components/PowerBI/ReportPicker';
import { ContextCode } from "./context";

interface ReportPickerAnyParams extends RouteProps {
    masterUser:string
}
class contextCodeSettler extends React.Component<RouteComponentProps<{}>> {
    public constructor(props: any) {
        super(props);
    }
    public render() {
        return (
        <ContextCode.Consumer>
            {({code, changeCode}) => {
                changeCode(this.props.location.search);
                return 'Changed';
            }}
        </ContextCode.Consumer>
        );
    }
}

const ReportPickerAny = ({masterUser, ...rest}: ReportPickerAnyParams) => <Route {...rest} render={props => (<ReportPicker masterUser={masterUser} {...props}/>)}/>;
export const routes = <Layout>
    <Route exact path='/' component={ Home } />
    <Route path='/AD' component={ contextCodeSettler } />
    <Route path='/counter' component={ Counter } />
    <Route path='/fetchdata' component={ FetchData } />
    <Route path='/powerBI' component={ PowerBILoader } />
    <Route path='/powerBINew' component={ ReportPicker } />
    <ReportPickerAny path='/powerBINew2' masterUser='master' />
    <ReportPickerAny path='/powerBIJMO' masterUser='JMO' />
</Layout>;
