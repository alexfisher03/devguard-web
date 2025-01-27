// Copyright (C) 2023 Tim Bastin, Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { middleware } from "@/decorators/middleware";
import { GetServerSidePropsContext } from "next";
import { FunctionComponent } from "react";
import Page from "../../components/Page";
import { withOrgs } from "../../decorators/withOrgs";
import { withSession } from "../../decorators/withSession";

import AverageFixingTimeChart from "@/components/overview/AverageFixingTimeChart";
import FlawAggregationState from "@/components/overview/FlawAggregationState";
import { RiskDistributionDiagram } from "@/components/overview/RiskDistributionDiagram";
import { RiskHistoryChart } from "@/components/overview/RiskHistoryDiagram";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { withOrganization } from "@/decorators/withOrganization";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import { getApiClientFromContext } from "@/services/devGuardApi";
import {
  AssetDTO,
  AverageFixingTime,
  DependencyCountByscanner,
  FlawAggregationStateAndChange,
  FlawCountByScanner,
  OrganizationDTO,
  ProjectDTO,
  RiskDistribution,
  RiskHistory,
} from "@/types/api/api";
import { classNames } from "@/utils/common";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { withContentTree } from "@/decorators/withContentTree";
import EmptyOverview from "@/components/common/EmptyOverview";
import { padRiskHistory } from "@/utils/server";
import { Button } from "../../components/ui/button";

interface Props {
  organization: OrganizationDTO & {
    projects: Array<
      ProjectDTO & {
        assets: Array<AssetDTO>;
      }
    >;
  };
  riskDistribution: RiskDistribution[] | null;
  riskHistory: Array<{
    history: RiskHistory[];
    label: string;
    slug: string;
    description: string;
  }>;
  flawCountByScanner: FlawCountByScanner;
  dependencyCountByscanner: DependencyCountByscanner;
  flawAggregationStateAndChange: FlawAggregationStateAndChange;
  avgLowFixingTime: AverageFixingTime;
  avgMediumFixingTime: AverageFixingTime;
  avgHighFixingTime: AverageFixingTime;
  avgCriticalFixingTime: AverageFixingTime;
}

const Home: FunctionComponent<Props> = ({
  organization,
  riskDistribution,
  riskHistory,
  flawAggregationStateAndChange,
  avgLowFixingTime,
  avgMediumFixingTime,
  avgHighFixingTime,
  avgCriticalFixingTime,
}) => {
  const orgMenu = useOrganizationMenu();

  if (riskHistory.length === 0) {
    return (
      <Page
        Title={
          <Link
            href={`/${organization.slug}/projects`}
            className="flex flex-row items-center gap-1 !text-white hover:no-underline"
          >
            {organization.name}{" "}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Organization
            </Badge>
          </Link>
        }
        title={organization.name ?? "Loading..."}
        Menu={orgMenu}
      >
        <EmptyOverview
          title="No Data Available"
          description="There is no data available for this organization. Please add a project to get started."
          Button={
            <Button
              onClick={() => {
                window.location.href = `/${organization.slug}/projects/`;
              }}
            >
              Add Project
            </Button>
          }
        />
      </Page>
    );
  }
  return (
    <Page
      Title={
        <Link
          href={`/${organization.slug}/projects`}
          className="flex flex-row items-center gap-1 !text-white hover:no-underline"
        >
          {organization.name}{" "}
          <Badge
            className="font-body font-normal !text-white"
            variant="outline"
          >
            Organization
          </Badge>
        </Link>
      }
      title={organization.name ?? "Loading..."}
      Menu={orgMenu}
    >
      {" "}
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-semibold">Overview</h1>
      </div>
      <div className="mt-4 grid gap-4">
        <FlawAggregationState
          description="The total risk this project poses to the organization"
          title="Organization Risk"
          totalRisk={riskHistory
            .map((r) => r.history[r.history.length - 1])
            .filter((r) => !!r)
            .reduce((acc, curr) => acc + curr.sumOpenRisk, 0)}
          data={flawAggregationStateAndChange}
        />
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <RiskDistributionDiagram data={riskDistribution ?? []} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vulnerable Projects</CardTitle>
              <CardDescription>
                The most vulnerable Projects in this organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {riskHistory.slice(0, 5).map((r) => (
                  <Link
                    href={organization.slug + "/projects/" + r.slug}
                    key={r.slug}
                    className="-mx-2 rounded-lg px-2 py-2 !text-card-foreground transition-all hover:bg-background hover:no-underline"
                  >
                    <div
                      key={r.label}
                      className={classNames("flex items-center gap-4")}
                    >
                      <Avatar>
                        <AvatarFallback>{r.label[0]}</AvatarFallback>
                      </Avatar>

                      <div className="grid ">
                        <p className="text-sm font-medium leading-none">
                          {r.label}
                        </p>
                        <small className="line-clamp-1 text-ellipsis text-muted-foreground">
                          {r.description}
                        </small>
                      </div>
                      <div className="ml-auto font-medium">
                        <Badge
                          className="whitespace-nowrap"
                          variant="secondary"
                        >
                          {" "}
                          {r.history[r.history.length - 1]?.sumOpenRisk.toFixed(
                            2,
                          ) ?? "0.00"}{" "}
                          Risk
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-4"></div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <AverageFixingTimeChart
            title="Low severity"
            description="Average fixing time for low severity vulnerabilities"
            avgFixingTime={avgLowFixingTime}
          />
          <AverageFixingTimeChart
            title="Medium severity"
            description="Average fixing time for medium severity vulnerabilities"
            avgFixingTime={avgMediumFixingTime}
          />
          <AverageFixingTimeChart
            title="High severity"
            description="Average fixing time for high severity vulnerabilities"
            avgFixingTime={avgHighFixingTime}
          />
          <AverageFixingTimeChart
            title="Critical severity"
            description="Average fixing time for critical severity vulnerabilities"
            avgFixingTime={avgCriticalFixingTime}
          />
        </div>
        <RiskHistoryChart data={riskHistory} />
        {/* <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2"></div>
      <DependenciesPieChart data={dependencyCountByscanner} />
    </div> */}
      </div>
    </Page>
  );
};

export default Home;

const extractDateOnly = (date: Date) => date.toISOString().split("T")[0];

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext, { organization }) => {
    const { organizationSlug } = context.params!;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const last3Month = new Date();
    last3Month.setMonth(last3Month.getMonth() - 3);

    const apiClient = getApiClientFromContext(context);
    const url = "/organizations/" + organizationSlug + "/stats";
    const [
      riskDistribution,
      riskHistory,
      flawAggregationStateAndChange,
      avgLowFixingTime,
      avgMediumFixingTime,
      avgHighFixingTime,
      avgCriticalFixingTime,
    ] = await Promise.all([
      apiClient(url + "/risk-distribution").then((r) => r.json()),
      apiClient(
        url +
          "/risk-history?start=" +
          extractDateOnly(last3Month) +
          "&end=" +
          extractDateOnly(new Date()),
      ).then(
        (r) =>
          r.json() as Promise<
            Array<{ riskHistory: RiskHistory[]; project: ProjectDTO }>
          >,
      ),
      apiClient(
        url +
          "/flaw-aggregation-state-and-change?compareTo=" +
          lastMonth.toISOString().split("T")[0],
      ).then((r) => r.json()),
      apiClient(url + "/average-fixing-time?severity=low").then((r) =>
        r.json(),
      ),
      apiClient(url + "/average-fixing-time?severity=medium").then((r) =>
        r.json(),
      ),
      apiClient(url + "/average-fixing-time?severity=high").then((r) =>
        r.json(),
      ),
      apiClient(url + "/average-fixing-time?severity=critical").then((r) =>
        r.json(),
      ),
    ]);

    const paddedRiskHistory = padRiskHistory(riskHistory);

    return {
      props: {
        organization,
        riskDistribution,
        riskHistory: paddedRiskHistory.map((r) => ({
          label: r.project.name,
          history: r.riskHistory,
          slug: r.project.slug,
          description: r.project.description,
        })),
        flawAggregationStateAndChange,
        avgLowFixingTime,
        avgMediumFixingTime,
        avgHighFixingTime,
        avgCriticalFixingTime,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    contentTree: withContentTree,
  },
);
