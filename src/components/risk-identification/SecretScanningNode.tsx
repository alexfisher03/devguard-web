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

import { useState } from "react";
import Stage from "./Stage";
import SecretScanningDialog from "./SecretScanningDialog";

function SecretScanning() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Stage
        onButtonClick={() => setIsOpen(true)}
        title="Secret Scanning"
        description="Scan git repositories for finding potential credentials leakage."
        buttonTitle="Add Secret Scanning"
        buttonVariant="secondary"
        id="secret-scanning"
      />
      <SecretScanningDialog open={isOpen} setOpen={setIsOpen} />
    </>
  );
}

export default SecretScanning;
