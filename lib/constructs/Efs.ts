import {FileSystem, FileSystemProps, LifecyclePolicy, PerformanceMode, ThroughputMode} from "@aws-cdk/aws-efs";
import {Construct, RemovalPolicy} from "@aws-cdk/core";
import {IVpc} from "@aws-cdk/aws-ec2";

interface Props extends FileSystemProps {
    vpc: IVpc,
}

export class Efs extends FileSystem {

    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id, {
            lifecyclePolicy: LifecyclePolicy.AFTER_14_DAYS,
            performanceMode: PerformanceMode.GENERAL_PURPOSE,
            throughputMode: ThroughputMode.BURSTING,
            removalPolicy: RemovalPolicy.DESTROY,
            ...props,
        });
    }

}
