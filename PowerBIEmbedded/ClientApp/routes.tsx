import * as React from 'react';
import { RouteProps } from 'react-router';
import { Route, RouteComponentProps } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { FetchData } from './components/FetchData';
import { Counter } from './components/Counter';
import { PowerBILoader } from './components/PowerBILoader';
import { ReportPicker } from './components/PowerBI/ReportPicker';
import { ContextCode, withContext } from "./context";

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

const withMasterUser = (UnwrappedComponent: React.ComponentType<any>, masterUser: string) =>
    class WithMasterUser extends React.Component<any> {
      render() {
        return (
            <UnwrappedComponent {...this.props} masterUser={masterUser}/>
        );
      }
    };

export const routes = <Layout>
    <Route exact path='/' component={ Home } />
    <Route path='/AD' component={ contextCodeSettler } />
    <Route path='/counter' component={ Counter } />
    <Route path='/fetchdata' component={ FetchData } />
    <Route path='/powerBI' component={ PowerBILoader } />
    <Route path='/powerBINew' component={ withContext(ReportPicker) } />
    <Route path='/powerBINew2' component={withMasterUser(withContext(ReportPicker), 'master')} />
    <Route path='/powerBIJMO' component={withMasterUser(withContext(ReportPicker), 'JMO')} />
</Layout>;
