import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";

// Collect values from runtime configuration for resource names and tags
const config = new pulumi.Config();

const namespace = config.require("namespace");
const environment = config.require("environment");
const name = config.require("name");

const tags = {
  namespace,
  environment,
  name,
};

const resourceGroup = new azure_native.resources.ResourceGroup("main-rg", {
  resourceGroupName: `${namespace}-${environment}-${name}-cluster-rg`,
  tags,
});

const cluster = new azure_native.containerservice.ManagedCluster("aks", {
  resourceName: `${namespace}-${environment}-${name}-aks`,
  location: resourceGroup.location,
  resourceGroupName: resourceGroup.name,
  nodeResourceGroup: `${namespace}-${environment}-${name}-node-rg`,
  dnsPrefix: `${namespace}-${environment}-${name}`,
  securityProfile: {
    imageCleaner: {
      enabled: false,
      intervalHours: 0,
    },
  },
  agentPoolProfiles: [{
    // Resource configuration
    name: "default",
    // Pool configuration
    mode: azure_native.containerservice.AgentPoolMode.System,
    type: azure_native.containerservice.AgentPoolType.VirtualMachineScaleSets,
    count: 1,
    upgradeSettings: {
      maxSurge: "10%",
      nodeSoakDurationInMinutes: 0,
    },
    // VM Configuration
    vmSize: "Standard_D2s_v3",
    osDiskSizeGB: 30,
    osType: azure_native.containerservice.OSType.Linux,
    // Tags
    tags,
  },
  {
    // Resource configuration
    name: "agentpool1",
    // Pool configuration
    mode: azure_native.containerservice.AgentPoolMode.User,
    type: azure_native.containerservice.AgentPoolType.VirtualMachineScaleSets,
    count: 1,
    // VM Configuration
    vmSize: "Standard_D2s_v3",
    osDiskSizeGB: 30,
    osType: azure_native.containerservice.OSType.Linux,
    upgradeSettings: {
      maxSurge: "10%",
      nodeSoakDurationInMinutes: 0,
    },
    // Tags
    tags,
  }],
  identity: {
    type: "SystemAssigned",
  },
  tags,
});

const agentPool = new azure_native.containerservice.AgentPool("agentPool", {
  // Resource configuration
  agentPoolName: "agentpool2",
  resourceGroupName: resourceGroup.name,
  resourceName: cluster.name,
  // Pool configuration
  mode: azure_native.containerservice.AgentPoolMode.User,
  type: azure_native.containerservice.AgentPoolType.VirtualMachineScaleSets,
  count: 1,
  upgradeSettings: {
    maxSurge: "10%",
    nodeSoakDurationInMinutes: 0,
  },
  // VM configuration
  vmSize: "Standard_D2s_v3",
  osDiskSizeGB: 30,
  osType: azure_native.containerservice.OSType.Linux,
  // Tags
  tags,
});

export { namespace, environment, name };
