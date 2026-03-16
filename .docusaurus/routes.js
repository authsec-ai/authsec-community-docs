import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/blog',
    component: ComponentCreator('/blog', 'b2f'),
    exact: true
  },
  {
    path: '/blog/archive',
    component: ComponentCreator('/blog/archive', '182'),
    exact: true
  },
  {
    path: '/blog/authors',
    component: ComponentCreator('/blog/authors', '0b7'),
    exact: true
  },
  {
    path: '/blog/authors/all-sebastien-lorber-articles',
    component: ComponentCreator('/blog/authors/all-sebastien-lorber-articles', '4a1'),
    exact: true
  },
  {
    path: '/blog/authors/yangshun',
    component: ComponentCreator('/blog/authors/yangshun', 'a68'),
    exact: true
  },
  {
    path: '/blog/first-blog-post',
    component: ComponentCreator('/blog/first-blog-post', '89a'),
    exact: true
  },
  {
    path: '/blog/long-blog-post',
    component: ComponentCreator('/blog/long-blog-post', '9ad'),
    exact: true
  },
  {
    path: '/blog/mdx-blog-post',
    component: ComponentCreator('/blog/mdx-blog-post', 'e9f'),
    exact: true
  },
  {
    path: '/blog/tags',
    component: ComponentCreator('/blog/tags', '287'),
    exact: true
  },
  {
    path: '/blog/tags/docusaurus',
    component: ComponentCreator('/blog/tags/docusaurus', '704'),
    exact: true
  },
  {
    path: '/blog/tags/facebook',
    component: ComponentCreator('/blog/tags/facebook', '858'),
    exact: true
  },
  {
    path: '/blog/tags/hello',
    component: ComponentCreator('/blog/tags/hello', '299'),
    exact: true
  },
  {
    path: '/blog/tags/hola',
    component: ComponentCreator('/blog/tags/hola', '00d'),
    exact: true
  },
  {
    path: '/blog/welcome',
    component: ComponentCreator('/blog/welcome', 'd2b'),
    exact: true
  },
  {
    path: '/markdown-page',
    component: ComponentCreator('/markdown-page', '3d7'),
    exact: true
  },
  {
    path: '/',
    component: ComponentCreator('/', '2e1'),
    exact: true
  },
  {
    path: '/',
    component: ComponentCreator('/', '399'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', '51e'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', 'e83'),
            routes: [
              {
                path: '/administration/',
                component: ComponentCreator('/administration/', '9b1'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/authentication/',
                component: ComponentCreator('/administration/authentication/', '0d3'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/authentication/manage-providers',
                component: ComponentCreator('/administration/authentication/manage-providers', '9d9'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/authentication/oidc-setup',
                component: ComponentCreator('/administration/authentication/oidc-setup', '209'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/authentication/saml-setup',
                component: ComponentCreator('/administration/authentication/saml-setup', '4fd'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/clients/',
                component: ComponentCreator('/administration/clients/', '9f6'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/clients/client-actions',
                component: ComponentCreator('/administration/clients/client-actions', 'bfa'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/clients/onboard-client',
                component: ComponentCreator('/administration/clients/onboard-client', 'a5c'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/enterprise-features/',
                component: ComponentCreator('/administration/enterprise-features/', '644'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/enterprise-features/external-services/',
                component: ComponentCreator('/administration/enterprise-features/external-services/', '142'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/enterprise-features/external-services/add-service',
                component: ComponentCreator('/administration/enterprise-features/external-services/add-service', '5c4'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/enterprise-features/external-services/manage-services',
                component: ComponentCreator('/administration/enterprise-features/external-services/manage-services', 'ac3'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/enterprise-features/external-services/secrets-management',
                component: ComponentCreator('/administration/enterprise-features/external-services/secrets-management', '65f'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/enterprise-features/logs-config/',
                component: ComponentCreator('/administration/enterprise-features/logs-config/', '0c1'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/enterprise-features/logs-config/elasticsearch',
                component: ComponentCreator('/administration/enterprise-features/logs-config/elasticsearch', '348'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/enterprise-features/logs-config/fluent-bit',
                component: ComponentCreator('/administration/enterprise-features/logs-config/fluent-bit', '306'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/enterprise-features/logs-config/splunk',
                component: ComponentCreator('/administration/enterprise-features/logs-config/splunk', 'adf'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/enterprise-features/logs-config/syslog',
                component: ComponentCreator('/administration/enterprise-features/logs-config/syslog', 'd79'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/rbac/create-permissions',
                component: ComponentCreator('/administration/rbac/create-permissions', '68c'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/rbac/create-role-bindings',
                component: ComponentCreator('/administration/rbac/create-role-bindings', '46a'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/rbac/create-roles',
                component: ComponentCreator('/administration/rbac/create-roles', '971'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/rbac/create-scopes',
                component: ComponentCreator('/administration/rbac/create-scopes', '917'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/rbac/getting-started',
                component: ComponentCreator('/administration/rbac/getting-started', 'e28'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/rbac/verify-application',
                component: ComponentCreator('/administration/rbac/verify-application', 'fe9'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/users/getting-started',
                component: ComponentCreator('/administration/users/getting-started', 'd39'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/users/invite-user',
                component: ComponentCreator('/administration/users/invite-user', '46e'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/administration/users/sync-from-directory',
                component: ComponentCreator('/administration/users/sync-from-directory', '94d'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/autonomous-agents',
                component: ComponentCreator('/autonomous-agents', '2fc'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/autonomous-agents/authorization-steps/',
                component: ComponentCreator('/autonomous-agents/authorization-steps/', '7e5'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/autonomous-agents/authorization-steps/configure-trust-policy',
                component: ComponentCreator('/autonomous-agents/authorization-steps/configure-trust-policy', 'a33'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/autonomous-agents/authorization-steps/enforce-rbac',
                component: ComponentCreator('/autonomous-agents/authorization-steps/enforce-rbac', '381'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/autonomous-agents/authorization-steps/issue-verify-svids',
                component: ComponentCreator('/autonomous-agents/authorization-steps/issue-verify-svids', 'ee8'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/autonomous-agents/authorization-steps/onboard-agent-a',
                component: ComponentCreator('/autonomous-agents/authorization-steps/onboard-agent-a', '7d0'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/autonomous-agents/authorization-steps/onboard-agent-b',
                component: ComponentCreator('/autonomous-agents/authorization-steps/onboard-agent-b', 'c5d'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/autonomous-agents/authorization-steps/test-authorization',
                component: ComponentCreator('/autonomous-agents/authorization-steps/test-authorization', '2f6'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/autonomous-agents/best-practices',
                component: ComponentCreator('/autonomous-agents/best-practices', 'c83'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/autonomous-agents/configure-workload',
                component: ComponentCreator('/autonomous-agents/configure-workload', 'ab2'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/autonomous-agents/faq',
                component: ComponentCreator('/autonomous-agents/faq', 'deb'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/autonomous-agents/integrate-spire',
                component: ComponentCreator('/autonomous-agents/integrate-spire', '7ec'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/autonomous-agents/understanding-m2m',
                component: ComponentCreator('/autonomous-agents/understanding-m2m', 'b0a'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/category/authentication',
                component: ComponentCreator('/category/authentication', '8f6'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/category/external-services',
                component: ComponentCreator('/category/external-services', '3f5'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/category/logs-configuration',
                component: ComponentCreator('/category/logs-configuration', 'b9b'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/ciba/',
                component: ComponentCreator('/ciba/', '123'),
                exact: true,
                sidebar: "cibaSidebar"
              },
              {
                path: '/ciba/api-reference',
                component: ComponentCreator('/ciba/api-reference', 'd6b'),
                exact: true,
                sidebar: "cibaSidebar"
              },
              {
                path: '/ciba/authentication-methods',
                component: ComponentCreator('/ciba/authentication-methods', '264'),
                exact: true,
                sidebar: "cibaSidebar"
              },
              {
                path: '/ciba/configuration',
                component: ComponentCreator('/ciba/configuration', 'c24'),
                exact: true,
                sidebar: "cibaSidebar"
              },
              {
                path: '/ciba/error-handling',
                component: ComponentCreator('/ciba/error-handling', '9f8'),
                exact: true,
                sidebar: "cibaSidebar"
              },
              {
                path: '/ciba/examples',
                component: ComponentCreator('/ciba/examples', 'ec6'),
                exact: true,
                sidebar: "cibaSidebar"
              },
              {
                path: '/ciba/faq',
                component: ComponentCreator('/ciba/faq', '8bb'),
                exact: true,
                sidebar: "cibaSidebar"
              },
              {
                path: '/ciba/installation',
                component: ComponentCreator('/ciba/installation', '0b1'),
                exact: true,
                sidebar: "cibaSidebar"
              },
              {
                path: '/getting-started',
                component: ComponentCreator('/getting-started', '1f3'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/getting-started/create-workspace',
                component: ComponentCreator('/getting-started/create-workspace', 'e83'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/getting-started/dashboard-overview',
                component: ComponentCreator('/getting-started/dashboard-overview', 'dd9'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/getting-started/first-login',
                component: ComponentCreator('/getting-started/first-login', 'ec6'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/getting-started/next-steps',
                component: ComponentCreator('/getting-started/next-steps', '546'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/getting-started/secure-account',
                component: ComponentCreator('/getting-started/secure-account', '7d4'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/getting-started/sign-in-setup',
                component: ComponentCreator('/getting-started/sign-in-setup', '9bd'),
                exact: true,
                sidebar: "mainDocsSidebar"
              },
              {
                path: '/sdk/',
                component: ComponentCreator('/sdk/', 'dc1'),
                exact: true,
                sidebar: "sdkSidebar"
              },
              {
                path: '/sdk/clients/mcp-servers',
                component: ComponentCreator('/sdk/clients/mcp-servers', '378'),
                exact: true,
                sidebar: "sdkSidebar"
              },
              {
                path: '/sdk/external-services/secret-management',
                component: ComponentCreator('/sdk/external-services/secret-management', 'fe4'),
                exact: true,
                sidebar: "sdkSidebar"
              },
              {
                path: '/sdk/faq',
                component: ComponentCreator('/sdk/faq', '547'),
                exact: true,
                sidebar: "sdkSidebar"
              },
              {
                path: '/sdk/rbac/permissions-resources',
                component: ComponentCreator('/sdk/rbac/permissions-resources', 'b48'),
                exact: true,
                sidebar: "sdkSidebar"
              },
              {
                path: '/sdk/rbac/role-bindings',
                component: ComponentCreator('/sdk/rbac/role-bindings', '438'),
                exact: true,
                sidebar: "sdkSidebar"
              },
              {
                path: '/sdk/rbac/scopes',
                component: ComponentCreator('/sdk/rbac/scopes', '774'),
                exact: true,
                sidebar: "sdkSidebar"
              },
              {
                path: '/sdk/workloads/autonomous-workloads',
                component: ComponentCreator('/sdk/workloads/autonomous-workloads', 'b64'),
                exact: true,
                sidebar: "sdkSidebar"
              },
              {
                path: '/status/',
                component: ComponentCreator('/status/', '197'),
                exact: true,
                sidebar: "statusSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
