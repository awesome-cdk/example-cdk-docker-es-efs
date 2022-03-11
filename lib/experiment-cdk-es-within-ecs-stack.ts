import * as cdk from '@aws-cdk/core';
import {Duration} from '@aws-cdk/core';
import {Cluster,} from "@aws-cdk/aws-ecs";
import {ApplicationLoadBalancer, ApplicationProtocol, Protocol} from "@aws-cdk/aws-elasticloadbalancingv2";
import {CheapVPC} from "./constructs/CheapVPC";
import {ElasticSearchService} from "./constructs/ElasticSearchService";
import {Efs} from "./constructs/Efs";

export class ExperimentCdkEsWithinEcsStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const vpc = new CheapVPC(this, 'Vpc');

        const fs = new Efs(this, 'EFS', {vpc});

        const cluster = new Cluster(this, 'Cluster', {
            vpc,
            enableFargateCapacityProviders: true,
        });

        const service = new ElasticSearchService(this, 'ES', {
            cluster,
            fs,
        })

        const alb = new ApplicationLoadBalancer(this, 'ALB', {vpc, internetFacing: true});

        ExperimentCdkEsWithinEcsStack.addTarget(alb, service, 9200);
        // ExperimentCdkEsWithinEcsStack.addTarget(alb, service, 9300);
    }

    private static addTarget(alb: ApplicationLoadBalancer, service: ElasticSearchService, port: number) {
        const protocol = ApplicationProtocol.HTTP;

        alb.addListener(`listener-${port}`, {
            port,
            protocol,
        }).addTargets(`target-${port}`, {
            port,
            protocol,
            targets: [
                service.service.loadBalancerTarget({
                    containerName: service.containerName,
                    containerPort: port,
                })
            ],
            healthCheck: {
                protocol: Protocol.HTTP,
                port: String(port),
                unhealthyThresholdCount: 5,
                healthyThresholdCount: 5,
                interval: Duration.seconds(60),
            }
        });
    }
}
