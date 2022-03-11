import {Construct} from "@aws-cdk/core";
import {Cluster, ContainerImage, FargateService, FargateTaskDefinition, LogDriver} from "@aws-cdk/aws-ecs";
import {RetentionDays} from "@aws-cdk/aws-logs";
import {AccessPoint, FileSystem} from "@aws-cdk/aws-efs";
import {Volume} from "@aws-cdk/aws-ecs/lib/base/task-definition";

export class ElasticSearchService extends Construct {
    public taskDefinition: FargateTaskDefinition;
    public service: FargateService;

    public containerName = 'es';

    constructor(scope: Construct, id: string, private props: {
        cluster: Cluster,
        fs: FileSystem,
    }) {
        super(scope, id);

        const accessPoint = new AccessPoint(this, 'EfsAccessPoint', {
            fileSystem: props.fs,
            path: `/data/${this.containerName}`,
            createAcl: {
                ownerGid: '1000',
                ownerUid: '1000',
                permissions: '750',
            },
            posixUser: {
                gid: '1000',
                uid: '1000',
            }
        });

        const volumeConfig: Volume = {
            name: "efs-volume",
            efsVolumeConfiguration: {
                fileSystemId: props.fs.fileSystemId,
                authorizationConfig: {
                    accessPointId: accessPoint.accessPointId,
                    iam: "ENABLED"
                },
                transitEncryption: "ENABLED",
            },
        };

        this.taskDefinition = new FargateTaskDefinition(this, 'FargateTaskDefinition', {
            ephemeralStorageGiB: 200,
            memoryLimitMiB: 2048,
            cpu: 256,
        });
        this.taskDefinition.addVolume(volumeConfig);

        const container = this.taskDefinition.addContainer(this.containerName, {
            image: ContainerImage.fromRegistry('elasticsearch:7.14.1'),
            portMappings: [
                {
                    containerPort: 9200,
                },
                {
                    containerPort: 9300,
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
        container.addMountPoints({
            containerPath: "/usr/share/elasticsearch/data",
            sourceVolume: volumeConfig.name,
            readOnly: false,
        })

        this.service = new FargateService(this, 'FargateService', {
            cluster: props.cluster,
            taskDefinition: this.taskDefinition,
        });

        props.fs.connections.allowDefaultPortFrom(this.service);
    }
}
