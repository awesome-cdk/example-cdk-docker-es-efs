import {InstanceType, NatProvider, Vpc, VpcProps} from "@aws-cdk/aws-ec2";
import {Construct} from "@aws-cdk/core";

// Configure the `natGatewayProvider` when defining a Vpc
const natGatewayProvider = NatProvider.instance({
    instanceType: new InstanceType('t3.small'),
});

export class CheapVPC extends Vpc {

    constructor(scope: Construct, id: string, props?: VpcProps) {
        super(scope, id, {
            // Override the Nat Gateway Provider to use Nat instances instead of Nat Gateways
            natGatewayProvider,
            // The 'natGateways' parameter now controls the number of NAT instances
            natGateways: 1,

            ...props,
        });
    }
}
