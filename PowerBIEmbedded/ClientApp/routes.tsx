import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { FetchData } from './components/FetchData';
import { Counter } from './components/Counter';
import { PowerBILoader } from './components/PowerBILoader';
import { ReportPicker } from './components/PowerBI/ReportPicker';

const ReportPickerMaster = (props: RouteComponentProps<{}>) => (<ReportPicker masterUser='master' {...props}/>);
const ReportPickerJMO = (props: RouteComponentProps<{}>) => (<ReportPicker masterUser='JMO' {...props}/>);
export const routes = <Layout>
    <Route exact path='/' component={ Home } />
    <Route path='/counter' component={ Counter } />
    <Route path='/fetchdata' component={ FetchData } />
    <Route path='/powerBI' component={ PowerBILoader } />
    <Route path='/powerBINew' component={ ReportPicker } />
    <Route path='/powerBINew2' render={ReportPickerMaster} />
    <Route path='/powerBIJMO' render={ReportPickerJMO} />
</Layout>;
