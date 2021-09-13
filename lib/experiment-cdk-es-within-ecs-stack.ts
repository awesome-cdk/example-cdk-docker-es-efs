import * as cdk from '@aws-cdk/core';
import {
    Cluster,
    ContainerImage,
    FargateService,
    FargateTaskDefinition,
    LogDriver,
    Protocol as EcsProtocol,
} from "@aws-cdk/aws-ecs";
import {ApplicationLoadBalancer, ApplicationProtocol, Protocol} from "@aws-cdk/aws-elasticloadbalancingv2";
import {RetentionDays} from "@aws-cdk/aws-logs";
import {CheapVPC} from "./constructs/CheapVPC";
import {ElasticSearchService} from "./constructs/ElasticSearchService";

export class ExperimentCdkEsWithinEcsStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const vpc = new CheapVPC(this, 'Vpc');

        const cluster = new Cluster(this, 'Cluster', {
            vpc,
            enableFargateCapacityProviders: true,
        });

        const service = new ElasticSearchService(this, 'ES', {
            cluster,
        })

        const alb = new ApplicationLoadBalancer(this, 'ALB', {vpc, internetFacing: true});

        const port = 9200;
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
                    protocol: EcsProtocol.TCP,
                }),
            ],
            healthCheck: {
                protocol: Protocol.HTTP,
                port: String(port),
            }
        });
    }
}
