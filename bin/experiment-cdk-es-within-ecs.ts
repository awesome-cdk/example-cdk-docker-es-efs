#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {ExperimentCdkEsWithinEcsStack} from '../lib/experiment-cdk-es-within-ecs-stack';

const app = new cdk.App();
new ExperimentCdkEsWithinEcsStack(app, 'experiment-es-within-ecs', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    }
});
