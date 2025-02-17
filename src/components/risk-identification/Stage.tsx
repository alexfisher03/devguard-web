// Copyright (C) 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
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
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { classNames } from "@/utils/common";
import { ReactNode } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useRouter } from "next/router";

function Stage({
  title,
  description,
  onButtonClick,
  buttonVariant,
  disableButton,
  buttonTitle,
  LastScan,
  id,
}: {
  title: string;
  description: string;
  buttonVariant: "default" | "outline" | "secondary";
  onButtonClick?: () => void;
  buttonTitle: string;
  disableButton?: boolean;
  LastScan?: ReactNode;
  id: string;
}) {
  const router = useRouter();
  const { query } = router;

  const highlight = query?.highlight === id;
  return (
    <Card className={classNames("h-full", highlight && "border-primary")}>
      <div
        className={classNames(
          Boolean(LastScan) && "animated-outline relative rounded-lg",
        )}
      >
        <div className="rounded-lg bg-card">
          <CardHeader>
            <CardTitle className="text-base">
              <div className="flex flex-row items-center gap-2">{title}</div>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col gap-2">
            <div className="flex w-full flex-row justify-end">
              <Button
                disabled={disableButton}
                variant={buttonVariant}
                onClick={onButtonClick}
              >
                {buttonTitle}
              </Button>
            </div>
            {Boolean(LastScan) && LastScan}
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}

export default Stage;
