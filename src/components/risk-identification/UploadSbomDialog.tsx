import { multipartBrowserApiClient } from "@/services/devGuardApi";
import React, { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "../ui/button";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { BranchTagSelector } from "../BranchTagSelector";

export default function UploadSbomDialog() {
  const router = useRouter();
  const org = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();
  const fileContent = useRef<any>();
  const [fileName, setFileName] = useState<string>();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        try {
          const readerContent = reader.result as string;
          let sbomParsed;
          sbomParsed = JSON.parse(readerContent);
          if (
            sbomParsed.bomFormat === "CycloneDX" &&
            sbomParsed.specVersion === "1.6"
          ) {
            fileContent.current = file;
            setFileName(file.name);
          } else
            toast.error(
              "SBOM does not follow CycloneDX format or Version is <1.6",
            );
        } catch (e) {
          toast.error(
            "JSON format is not recognized, make sure it is the proper format",
          );
          return;
        }
      };

      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/json": [".json"] },
  });

  const uploadSBOM = async () => {
    const formdata = new FormData();
    formdata.append("file", fileContent.current);
    const resp = await multipartBrowserApiClient(
      `/organizations/${org.slug}/projects/${project?.slug}/assets/${asset?.slug}/sbom-file`,

      {
        method: "POST",
        body: formdata,
        headers: { "X-Scanner": "SBOM-File-Upload" },
      },
    );
    if (resp.ok) {
      toast.success("SBOM has successfully been send!");
    } else {
      toast.error("SBOM has not been send successfully");
    }
    router.push(
      `/${org.slug}/projects/${project?.slug}/assets/${asset?.slug}/refs/main/dependency-risks/`,
    );
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className="mb-5 mt-5 flex h-20 cursor-pointer items-center justify-center rounded border border-dashed"
      >
        <input {...getInputProps()} />
        {fileName ? (
          <p>{fileName}</p>
        ) : (
          <p className="text-muted-foreground">
            Drag and drop some files here, or click to select files
          </p>
        )}
      </div>
      <div className="flex flex-row justify-end">
        <Button onClick={() => uploadSBOM()} disabled={!fileName}>
          Upload
        </Button>
      </div>
    </div>
  );
}
