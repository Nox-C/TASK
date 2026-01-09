"use client";

import { Badge, Button, Card } from "@task/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { CardHeader, CardContent, CardTitle } from "../../components/ui/card";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Key,
  Link,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface ExchangeConnection {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "error";
  lastSync: string;
  apiKey: string;
  permissions: string[];
  balance: number;
  features: string[];
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<ExchangeConnection[]>([
    {
      id: "1",
      name: "Binance",
      status: "connected",
      lastSync: "2 minutes ago",
      apiKey: "binance_****abcd1234",
      permissions: ["read", "trade"],
      balance: 125000.5,
      features: ["spot", "futures", "margin"],
    },
    {
      id: "2",
      name: "Coinbase",
      status: "disconnected",
      lastSync: "1 hour ago",
      apiKey: "coinbase_****efgh5678",
      permissions: ["read"],
      balance: 0,
      features: ["spot"],
    },
    {
      id: "3",
      name: "Crypto.com",
      status: "error",
      lastSync: "3 hours ago",
      apiKey: "crypto_****ijkl9012",
      permissions: ["read", "trade"],
      balance: 45000.0,
      features: ["spot", "derivatives"],
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newExchange, setNewExchange] = useState({
    name: "",
    apiKey: "",
    apiSecret: "",
    permissions: ["read"],
  });

  const availableExchanges = [
    { name: "Binance", features: ["spot", "futures", "margin", "options"] },
    { name: "Coinbase", features: ["spot", "pro"] },
    { name: "Crypto.com", features: ["spot", "derivatives", "stake"] },
    { name: "Kraken", features: ["spot", "futures", "margin"] },
    { name: "KuCoin", features: ["spot", "futures", "margin"] },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "disconnected":
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: "success",
      disconnected: "warning",
      error: "danger",
    } as const;
    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status}
      </Badge>
    );
  };

  const testConnection = async (connectionId: string) => {
    // Simulate connection test
    setConnections((prev) =>
      prev.map((conn) =>
        conn.id === connectionId
          ? { ...conn, status: "connected", lastSync: "Just now" }
          : conn
      )
    );
  };

  const disconnect = async (connectionId: string) => {
    setConnections((prev) =>
      prev.map((conn) =>
        conn.id === connectionId
          ? { ...conn, status: "disconnected", balance: 0 }
          : conn
      )
    );
  };

  const addConnection = () => {
    const newConnection: ExchangeConnection = {
      id: Date.now().toString(),
      name: newExchange.name,
      status: "connected",
      lastSync: "Just now",
      apiKey: `${newExchange.name.toLowerCase()}_****${newExchange.apiKey.slice(
        -4
      )}`,
      permissions: newExchange.permissions,
      balance: 0,
      features:
        availableExchanges.find((e) => e.name === newExchange.name)?.features ||
        [],
    };

    setConnections([...connections, newConnection]);
    setNewExchange({
      name: "",
      apiKey: "",
      apiSecret: "",
      permissions: ["read"],
    });
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Exchange Connections
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your exchange integrations and API connections
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Exchange
          </Button>
        </div>

        {/* Connection Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Connections
              </CardTitle>
              <Link className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{connections.length}</div>
              <p className="text-xs text-muted-foreground">
                Exchanges connected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {connections.filter((c) => c.status === "connected").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently connected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Balance
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {connections
                  .reduce((sum, conn) => sum + conn.balance, 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all exchanges
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {connections.filter((c) => c.status === "error").length}
              </div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Connection Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Exchange Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Exchange
                  </label>
                  <select
                    value={newExchange.name}
                    onChange={(e) =>
                      setNewExchange({ ...newExchange, name: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select exchange</option>
                    {availableExchanges.map((exchange) => (
                      <option key={exchange.name} value={exchange.name}>
                        {exchange.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={newExchange.apiKey}
                    onChange={(e) =>
                      setNewExchange({ ...newExchange, apiKey: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter API key"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    API Secret
                  </label>
                  <input
                    type="password"
                    value={newExchange.apiSecret}
                    onChange={(e) =>
                      setNewExchange({
                        ...newExchange,
                        apiSecret: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter API secret"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    {["read", "trade", "withdraw"].map((perm) => (
                      <label key={perm} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newExchange.permissions.includes(perm)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewExchange({
                                ...newExchange,
                                permissions: [...newExchange.permissions, perm],
                              });
                            } else {
                              setNewExchange({
                                ...newExchange,
                                permissions: newExchange.permissions.filter(
                                  (p) => p !== perm
                                ),
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        {perm.charAt(0).toUpperCase() + perm.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={addConnection}>Add Connection</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="connections" className="space-y-6">
          <TabsList>
            <TabsTrigger active>Connections</TabsTrigger>
            <TabsTrigger>Permissions</TabsTrigger>
            <TabsTrigger>Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent>
            <div className="space-y-4">
              {connections.map((connection) => (
                <Card key={connection.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(connection.status)}
                        <div>
                          <h3 className="font-semibold text-lg">
                            {connection.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {connection.apiKey}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(connection.status)}
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Last Sync</p>
                        <p className="font-medium">{connection.lastSync}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Balance</p>
                        <p className="font-medium">
                          ${connection.balance.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Permissions</p>
                        <div className="flex gap-1">
                          {connection.permissions.map((perm) => (
                            <Badge
                              key={perm}
                              variant="info"
                              className="text-xs"
                            >
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Features</p>
                        <div className="flex gap-1">
                          {connection.features.slice(0, 2).map((feature) => (
                            <Badge
                              key={feature}
                              variant="default"
                              className="text-xs"
                            >
                              {feature}
                            </Badge>
                          ))}
                          {connection.features.length > 2 && (
                            <Badge variant="default" className="text-xs">
                              +{connection.features.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {connection.status === "connected" ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => disconnect(connection.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => testConnection(connection.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Test Connection
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Key className="h-4 w-4 mr-2" />
                        Regenerate Keys
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  API Permissions Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Read</h4>
                      <p className="text-sm text-gray-600">
                        View account balances, order history, and market data
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Trade</h4>
                      <p className="text-sm text-gray-600">
                        Place and manage orders, modify positions
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Withdraw</h4>
                      <p className="text-sm text-gray-600">
                        Transfer funds to external wallets
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent>
            <Card>
              <CardHeader>
                <CardTitle>Connection Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Connection activity logs will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
