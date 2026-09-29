import { createBrowserRouter, redirect } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import App from '../App'
import { queryClient } from '../api/queryClient'
import AppLayout from '../components/layouts/AppLayout'
import AuthLayout from '../components/layouts/AuthLayout'
import DeIdentifyLayout from '../components/layouts/DeIdentifyLayout'
import LandingLayout from '../components/layouts/LandingLayout'
import { sessionQuery } from '../hooks'
import ComplianceStepPage from '../pages/ComplianceStepPage'
import ConfigurationStepPage from '../pages/ConfigurationStepPage'
import DashboardPage from '../pages/DashboardPage'
import DataInputStepPage from '../pages/DataInputStepPage'
import GeneratedDataPage from '../pages/GeneratedDataPage'
import GenerationSettingsPage from '../pages/GenerationSettingsPage'
import NotFoundPage from '../pages/NotFoundPage'
import ReviewStepPage from '../pages/ReviewStepPage'
import LoginPage from '../pages/auth/LoginPage'
import ContactUsPage from '../pages/landing/ContactUsPage'
import SolutionsPage from '../pages/landing/SolutionsPage'
import type { RouteHandle } from './handle'

// The access token lives in memory, so the session comes from the refresh
// cookie (fetched once, then cached) instead of localStorage.
const loader = async () => {
  const session = await queryClient.ensureQueryData(sessionQuery)
  if (!session) return redirect('/auth/login')
  return null
}

const authLoader = async () => {
  const session = await queryClient.ensureQueryData(sessionQuery)
  if (session) return redirect('/app')
  return null
}

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: App,
    children: [
      {
        Component: LandingLayout,
        children: [
          {
            index: true,
            Component: SolutionsPage,
          },
          {
            path: 'contact-us',
            Component: ContactUsPage,
          },
        ],
      },
      {
        path: 'app',
        Component: AppLayout,
        loader,
        children: [
          {
            index: true,
            Component: DashboardPage,
            handle: { title: 'Dashboard' } satisfies RouteHandle,
          },
          {
            path: 'de-identify',
            Component: DeIdentifyLayout,
            handle: {
              title: 'New Analysis',
              subtitle: 'Configure your anonymization pipeline',
            } satisfies RouteHandle,
            children: [
              {
                index: true,
                loader: () => redirect('/app/de-identify/compliance'),
              },
              {
                path: 'compliance',
                Component: ComplianceStepPage,
              },
              {
                path: 'input',
                Component: DataInputStepPage,
              },
              {
                path: 'configuration',
                Component: ConfigurationStepPage,
              },
              {
                path: 'review',
                Component: ReviewStepPage,
              },
            ],
          },
          {
            path: 'synthetic',
            handle: {
              title: 'Synthetic Data Generator',
              subtitle: 'Generate realistic but completely fake clinical data for development',
            } satisfies RouteHandle,
            children: [
              {
                index: true,
                loader: () => redirect('/app/synthetic/settings'),
              },
              {
                path: 'settings',
                Component: GenerationSettingsPage,
              },
              {
                path: 'result',
                Component: GeneratedDataPage,
                handle: {
                  title: 'Generated Data',
                  subtitle: 'Review your dataset before downloading',
                } satisfies RouteHandle,
              },
            ],
          },
        ],
      },
      {
        path: 'auth',
        Component: AuthLayout,
        loader: authLoader,
        children: [
          {
            index: true,
            loader: () => redirect('/auth/login'),
          },
          {
            path: 'login',
            Component: LoginPage,
          },
        ],
      },
      {
        path: '*',
        Component: NotFoundPage,
      },
    ],
  },
]

const router = createBrowserRouter(routes)

export default router
