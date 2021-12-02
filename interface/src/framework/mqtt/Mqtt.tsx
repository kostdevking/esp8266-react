import React, { FC, useContext } from 'react';
import { Redirect, Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';

import { Tab, Tabs } from '@mui/material';

import { AdminRoute, useLayoutTitle } from '../../components';
import { AuthenticatedContext } from '../../contexts/authentication';

import MqttStatusForm from './MqttStatusForm';
import MqttSettingsForm from './MqttSettingsForm';

const MqttRouting: FC = () => {
  useLayoutTitle("Network Time");

  const history = useHistory();
  const { url } = useRouteMatch();
  const authenticatedContext = useContext(AuthenticatedContext);

  const handleTabChange = (event: React.ChangeEvent<{}>, path: string) => {
    history.push(path);
  };

  return (
    <>
      <Tabs value={url} onChange={handleTabChange} variant="fullWidth">
        <Tab value="/mqtt/status" label="MQTT Status" />
        <Tab value="/mqtt/settings" label="MQTT Settings" disabled={!authenticatedContext.me.admin} />
      </Tabs>
      <Switch>
        <Route exact path="/mqtt/status">
          <MqttStatusForm />
        </Route>
        <AdminRoute exact path="/mqtt/settings">
          <MqttSettingsForm />
        </AdminRoute>
        <Redirect to="/mqtt/status" />
      </Switch>
    </>
  );

};

const Mqtt: FC = () => (
  <Switch>
    <Route exact path="/mqtt/*">
      <MqttRouting />
    </Route>
    <Redirect to="/mqtt/status" />
  </Switch>
);

export default Mqtt;
