"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { RiskDistribution } from "@/types/api/api";
import { generateColor } from "@/utils/view";

//  { range: "0-2", scanner1: 186, scanner2: 80 },
const combineRanges = (data: RiskDistribution[]) => {
  const low = data
    .map((el) => ({ [el.assetId]: el.low }))
    .reduce((acc, el) => ({ ...acc, ...el }), { range: "LOW" });

  const medium = data
    .map((el) => ({ [el.assetId]: el.medium }))
    .reduce((acc, el) => ({ ...acc, ...el }), { range: "MEDIUM" });

  const high = data
    .map((el) => ({ [el.assetId]: el.high }))
    .reduce((acc, el) => ({ ...acc, ...el }), { range: "HIGH" });

  const critical = data
    .map((el) => ({ [el.assetId]: el.critical }))
    .reduce((acc, el) => ({ ...acc, ...el }), { range: "CRITICAL" });

  return [low, medium, high, critical];
};

export function RiskDistributionDiagram({
  data,
}: {
  data: RiskDistribution[];
}) {
  const chartConfig = data.reduce(
    (acc, el, i) => ({
      ...acc,
      [el.assetId]: {
        label: el.label,
        color: generateColor(el.label),
      },
    }),
    {} as any,
  );

  const amountOfElements = Object.keys(chartConfig).length;
  const chartData = combineRanges(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Vulnerabilities</CardTitle>
        <CardDescription>
          Showing the distribution of vulnerabilities based on the risk range
          and the scan type.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={305}>
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="range"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                //tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent className="bg-background" />}
              />
              {amountOfElements < 6 && (
                <ChartLegend
                  content={<ChartLegendContent verticalAlign={"middle"} />}
                />
              )}
              {Object.keys(chartConfig).map((id, i, arr) => (
                <Bar
                  key={id}
                  dataKey={id}
                  radius={4}
                  fill={chartConfig[id].color}
                />
              ))}
            </BarChart>
          </ChartContainer>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
