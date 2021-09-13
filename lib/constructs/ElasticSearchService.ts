import {Construct} from "@aws-cdk/core";
import {Cluster, ContainerImage, FargateService, FargateTaskDefinition, LogDriver} from "@aws-cdk/aws-ecs";
import {Protocol as EcsProtocol} from "@aws-cdk/aws-ecs/lib/container-definition";
import {RetentionDays} from "@aws-cdk/aws-logs";

export class ElasticSearchService extends Construct {
    public taskDefinition: FargateTaskDefinition;
    public service: FargateService;

    public containerName = 'es';

    constructor(scope: Construct, id: string, private props: {
        cluster: Cluster,
    }) {
        super(scope, id);

        this.taskDefinition = new FargateTaskDefinition(this, 'FargateTaskDefinition', {
            ephemeralStorageGiB: 200,
            memoryLimitMiB: 8192,
            cpu: 4096,
        });

        this.taskDefinition.addContainer(this.containerName, {
            image: ContainerImage.fromRegistry('elasticsearch:7.14.1'),
            portMappings: [
                {
                    containerPort: 9200,
                    protocol: EcsProtocol.TCP,
                },
                {
                    containerPort: 9300,
                    protocol: EcsProtocol.TCP,
                },
            ],
            logging: LogDriver.awsLogs({
                logRetention: RetentionDays.ONE_WEEK,
                streamPrefix: this.containerName,
            }),
            environment: {
                "discovery.type": "single-node",
            },
        });

        this.service = new FargateService(this, 'FargateService', {
            cluster: props.cluster,
            taskDefinition: this.taskDefinition,
        });
    }
}
