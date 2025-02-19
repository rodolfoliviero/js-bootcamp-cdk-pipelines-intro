import { Construct, Stack, StackProps } from "@aws-cdk/core";
import {
  CodePipeline,
  CodePipelineSource,
  ManualApprovalStep,
  ShellStep,
} from "@aws-cdk/pipelines";
import { CdkpipelinesDemoStage } from "./cdkpipelines-demo-stage";

/**
 * The stack that defines the application pipeline
 */
export class CdkpipelinesDemoPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, "Pipeline", {
      // The pipeline name
      pipelineName: "MyServicePipeline",

      // How it will be built and synthesized
      synth: new ShellStep("Synth", {
        // Where the source can be found
        input: CodePipelineSource.gitHub("rodolfoliviero/js-bootcamp-cdk-pipelines-intro", "main"),

        // Install dependencies, build and run cdk synth
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });

    const prod = new CdkpipelinesDemoStage(this, "Prod", {
      env: { account: "555510899726", region: "us-east-1"}
    });

    pipeline.addStage(
      new CdkpipelinesDemoStage(this, "PreProd", {
        env: { account: "555510899726", region: "us-east-1"}
      })
    );

    pipeline.addStage(prod,{
      pre: [new ManualApprovalStep("PromoteToProd")]
    }
    );

    // This is where we add the application stages
    // ...
  }
}
