import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

// Public client for read operations
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

export async function POST(request: NextRequest) {
  try {
    const { from, to, amount, chainId } = await request.json()

    if (!from || !to || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: from, to, amount' },
        { status: 400 }
      )
    }

    // For now, return a mock transaction response
    // In production, this would integrate with your actual trading system
    const txHash = `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`

    return NextResponse.json({
      success: true,
      txHash,
      from,
      to,
      amount,
      chainId,
      timestamp: new Date().toISOString(),
      message: 'Transaction submitted successfully'
    })

  } catch (error) {
    console.error('Transaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter required' },
      { status: 400 }
    )
  }

  try {
    // Get wallet balance
    const balance = await publicClient.getBalance({
      address: address as `0x${string}`,
    })

    // Get transaction count
    const transactionCount = await publicClient.getTransactionCount({
      address: address as `0x${string}`,
    })

    return NextResponse.json({
      address,
      balance: balance.toString(),
      transactionCount,
      formattedBalance: (Number(balance) / 1e18).toFixed(6),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Wallet info error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet information' },
      { status: 500 }
    )
  }
}
