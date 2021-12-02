import { FC, useCallback, useContext, useEffect } from 'react';
import { Redirect, Switch } from 'react-router';
import { Route, useHistory, useLocation } from 'react-router-dom';
import { AxiosError } from 'axios';

import * as AuthenticationApi from './api/authentication';
import { PROJECT_PATH } from './api/env';
import { AXIOS } from './api/endpoints';
import { AdminRoute, Layout } from './components';
import { FeaturesContext } from './contexts/features';

import ProjectRouting from './project/ProjectRouting';
import WiFiConnection from './framework/wifi/WiFiConnection';
import AccessPoint from './framework/ap/AccessPoint';
import NetworkTime from './framework/ntp/NetworkTime';
import Mqtt from './framework/mqtt/Mqtt';
import Security from './framework/security/Security';
import System from './framework/system/System';

const AuthenticatedRouting: FC = () => {

  const { features } = useContext(FeaturesContext);
  const location = useLocation();
  const history = useHistory();

  const handleApiResponseError = useCallback((error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      AuthenticationApi.storeLoginRedirect(location);
      history.push("/unauthorized");
    }
    return Promise.reject(error);
  }, [location, history]);

  useEffect(() => {
    const axiosHandlerId = AXIOS.interceptors.response.use((response) => response, handleApiResponseError);
    return () => AXIOS.interceptors.response.eject(axiosHandlerId);
  }, [handleApiResponseError]);

  return (
    <Layout>
      <Switch>
        {features.project && (
          <Route path={`/${PROJECT_PATH}`}>
            <ProjectRouting />
          </Route>
        )}
        <Route path="/wifi">
          <WiFiConnection />
        </Route>
        <Route path="/ap">
          <AccessPoint />
        </Route>
        {features.ntp && (
          <Route path="/ntp">
            <NetworkTime />
          </Route>
        )}
        {features.mqtt && (
          <Route path="/mqtt">
            <Mqtt />
          </Route>
        )}
        {features.security && (
          <AdminRoute path="/security">
            <Security />
          </AdminRoute>
        )}
        <Route path="/system">
          <System />
        </Route>
        <Redirect to={AuthenticationApi.getDefaultRoute(features)} />
      </Switch>
    </Layout>
  );
};

export default AuthenticatedRouting;
