import torch
import torch.nn as nn
import torch.nn.functional as F

from .gcn import unit_gcn, unit_tcn, mstcn

class STGCNBlock(nn.Module):
    def __init__(self, in_channels, out_channels, A, stride=1, residual=True, **kwargs):
        super(STGCNBlock, self).__init__()
        self.A = A

        gcn_kwargs = {k[4:]: v for k, v in kwargs.items() if k[:4] == 'gcn_'}
        tcn_kwargs = {k[4:]: v for k, v in kwargs.items() if k[:4] == 'tcn_'}
        kwargs = {k: v for k, v in kwargs.items() if k[:4] not in ['gcn_', 'tcn_']}
        assert len(kwargs) == 0, f'Invalid arguments: {kwargs}'

        tcn_type = tcn_kwargs.pop('type', 'unit_tcn')
        assert tcn_type in ['unit_tcn', 'mstcn']
        gcn_type = gcn_kwargs.pop('type', 'unit_gcn')
        assert gcn_type in ['unit_gcn']

        self.gcn = unit_gcn(in_channels, out_channels, self.A, **gcn_kwargs)

        if tcn_type == 'mstcn':
            self.tcn = mstcn(out_channels, out_channels, 9, stride=stride, **tcn_kwargs)
        elif tcn_type == 'unit_tcn':
            self.tcn = unit_tcn(out_channels, out_channels, stride=stride,**tcn_kwargs)
        
        self.relu = nn.ReLU()

        if not residual:
            self.residual = lambda x: 0
        elif (in_channels == out_channels) and (stride == 1):
            self.residual = lambda x: x
        else:
            self.residual = unit_tcn(in_channels, out_channels, kernel_size=1, stride=stride)
        
    def forward(self, x):
        res = self.residual(x)
        x = self.tcn(self.gcn(x)) + res
        return x
    
class SimpleSTGCNBlock(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size_spatial=25, kernel_size_temporal=9):
        super(SimpleSTGCNBlock, self).__init__()
        self.spatial_conv = nn.Conv2d(in_channels, out_channels, kernel_size=(1, kernel_size_spatial), padding=(0, kernel_size_spatial // 2))
        self.temp_conv = nn.Conv2d(out_channels, out_channels, kernel_size=(kernel_size_temporal, 1), padding=(kernel_size_temporal // 2, 0))
        self.norm = nn.BatchNorm2d(out_channels)
        
    def forward(self, x):
        x = self.spatial_conv(x)
        x = F.relu(x)
        x = self.temp_conv(x)
        x = F.relu(x)
        x = self.norm(x)
        return x

class STGCN(nn.Module):
    def __init__(self, in_channels, out_channels, num_blocks=2, kernel_size_spatial=25, kernel_size_temporal=9):
        super(STGCN, self).__init__()
        self.num_blocks = num_blocks
        self.blocks = nn.ModuleList()
        
        for _ in range(num_blocks):
            block = SimpleSTGCNBlock(in_channels, out_channels, kernel_size_spatial, kernel_size_temporal)
            self.blocks.append(block)
            in_channels = out_channels
        
    def forward(self, x):
        for block in self.blocks:
            x = block(x)
        return x