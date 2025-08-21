import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure";

const config = new pulumi.Config();

const namespace = config.require("namespace");
const environment = config.require("environment");
const name = config.require("name");

const tags = {
  namespace,
  environment,
  name,
};

const resourceGroup = new azure.core.ResourceGroup("main-rg", {
  name: `${namespace}-${environment}-${name}-cluster-rg`,
  tags,
});

const cluster = new azure.containerservice.KubernetesCluster("aks", {
  name: `${namespace}-${environment}-${name}-aks`,
  location: resourceGroup.location,
  resourceGroupName: resourceGroup.name,
  nodeResourceGroup: `${namespace}-${environment}-${name}-node-rg`,
  dnsPrefix: `${namespace}-${environment}-${name}`,
  defaultNodePool: {
    // Resource configuration
    name: "default",
    // Pool configuration
    type: "VirtualMachineScaleSets",
    temporaryNameForRotation: "rdefault",
    nodeCount: 1,
    upgradeSettings: {
      drainTimeoutInMinutes: 0,
      maxSurge: "10%",
      nodeSoakDurationInMinutes: 0,
    },
    // VM configuration
    vmSize: "Standard_D2s_v3",
    osDiskSizeGb: 30,
    // Tags
    tags,
  },
  identity: {
    type: "SystemAssigned",
  },
  tags,
  // }, {
  //   retainOnDelete: true,
});

const agentPool1 = new azure.containerservice.KubernetesClusterNodePool("agentPool1", {
  // Resource configuration
  name: "agentpool1",
  // resourceGroupName: resourceGroup.name,
  kubernetesClusterId: cluster.id,
  // Pool configuration
  mode: "User",
  nodeCount: 1,
  temporaryNameForRotation: "ragentpool1",
  upgradeSettings: {
    drainTimeoutInMinutes: 0,
    maxSurge: "10%",
    nodeSoakDurationInMinutes: 0,
  },
  // VM configuration
  vmSize: "Standard_D2s_v3",
  osDiskType: "Ephemeral",
  osDiskSizeGb: 30,
  osType: "Linux",
  // Tags
  tags,
  // }, {
  //   retainOnDelete: true,
});

const agentPool2 = new azure.containerservice.KubernetesClusterNodePool("agentPool2", {
  // Resource configuration
  name: "agentpool2",
  // resourceGroupName: resourceGroup.name,
  kubernetesClusterId: cluster.id,
  // Pool configuration
  mode: "User",
  nodeCount: 1,
  temporaryNameForRotation: "ragentpool2",
  upgradeSettings: {
    drainTimeoutInMinutes: 0,
    maxSurge: "10%",
    nodeSoakDurationInMinutes: 0,
  },
  // VM configuration
  vmSize: "Standard_D2s_v3",
  osDiskType: "Ephemeral",
  osDiskSizeGb: 30,
  osType: "Linux",
  // Tags
  tags,
  // }, {
  //   retainOnDelete: true,
});

export { namespace, environment, name };
