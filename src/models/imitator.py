import torch
import torch.nn as nn
from .components.stgcn import STGCNBlock, partition_adjacency
from torch.utils.checkpoint import checkpoint

class Imitator(nn.Module):
    def __init__(
        self,
        A,
        input_size: int,
        encoder_hidden_size: int = 512,
        decoder_hidden_size: int = 512,
        output_size: int = 2048,  # final embedding size if you want
        nhead: int = 8,
        ff_dim: int = 2048,
        n_encoder_layers: int = 2,
        n_decoder_layers: int = 2,
        max_seq_length: int = 20,
        encoder_dropout: int = 0.4,
        decoder_dropout: int = 0.4,
    ):
        super().__init__()

        self.cfg = {
            "input_size": input_size,
            "output_size": output_size,
            "encoder_hidden_size": encoder_hidden_size,
            "decoder_hidden_size": decoder_hidden_size,
            "nhead": nhead,
            "ff_dim": ff_dim,
            "n_encoder_layers": n_encoder_layers,
            "n_decoder_layers": n_decoder_layers,
            "max_seq_length": max_seq_length,
            "encoder_dropout": encoder_dropout,
            "decoder_dropout": decoder_dropout,
        }

        print("Model Parameters: ", self.cfg)

        # ---- Encoder: Same as before ----
        A = partition_adjacency(A)
        self.stgcn = STGCNBlock(2, encoder_hidden_size // 2, A, kernel_size=3, stride=1)
        self.linear_hidden = nn.Sequential(
            nn.Conv2d(3 * (encoder_hidden_size // 2), encoder_hidden_size, kernel_size=1),
            nn.ReLU(),
            nn.BatchNorm2d(encoder_hidden_size)
        )

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=encoder_hidden_size,
            nhead=nhead,
            dim_feedforward=ff_dim,
            dropout=encoder_dropout,
            batch_first=True,
            norm_first=True
        )
        self.encoder = nn.TransformerEncoder(encoder_layer, num_layers=n_encoder_layers)

        self.encoder_proj = nn.Linear(encoder_hidden_size, decoder_hidden_size) if encoder_hidden_size != decoder_hidden_size else nn.Identity()

        self.query_embed = nn.Parameter(
            torch.randn(max_seq_length, decoder_hidden_size)
        )

        # ---- Decoder ----
        decoder_layer = nn.TransformerDecoderLayer(
            d_model=decoder_hidden_size,
            nhead=nhead,
            dim_feedforward=ff_dim,
            dropout=decoder_dropout,
            batch_first=True,
            norm_first=True
        )
        self.decoder = nn.TransformerDecoder(decoder_layer, num_layers=n_decoder_layers)

        self.out_proj = nn.Linear(decoder_hidden_size, output_size) if output_size != decoder_hidden_size else nn.Identity()

    def encode(self, x, frames_padding_mask):
        def encoder_forward(x):
            x = self.pe(x)
            return self.encoder(x, src_key_padding_mask=frames_padding_mask)
        def stgcn_forward(x):
            return self.stgcn(x)

        B, T, N, C = x.shape        # x -> [batch_size, T, input_size]
        x = x.permute(0, 3, 1, 2)   # [B, C, T, N]
        if self.training:
            x = checkpoint(stgcn_forward, x, use_reentrant=False)
        else:
            x = self.stgcn(x)  # [B, 3*out_channels, T, K]

        x = self.linear_hidden(x)   # [B, hidden, T, K]
        x = x.mean(dim=-1)          # [B, hidden, T]
        x = x.permute(0, 2, 1).contiguous() # [B, T, hidden]

        if self.training:
            x = checkpoint(encoder_forward, x, use_reentrant=False)
        else:
            x = encoder_forward(x)  # [B, pool_dim, hidden]
        
        x = self.encoder_proj(x)
        
        return x
    
    def decode(self, encoder_out, tgt_embeddings, memory_key_padding_mask):
        T_q = tgt_embeddings.size(1) #x->[B, T, output_size]
        tgt_mask = nn.Transformer.generate_square_subsequent_mask(T_q).to(tgt_embeddings.device)
        def decoder_forward(tgt, memory):
            return self.decoder(
                tgt=tgt,
                memory=memory,
                tgt_mask=tgt_mask,
                memory_key_padding_mask=memory_key_padding_mask
            )
        if self.training:
            out = checkpoint(decoder_forward, tgt_embeddings, encoder_out, use_reentrant=False)
        else:
            out = self.decoder(
                tgt=tgt_embeddings,
                memory=encoder_out,
                tgt_mask=tgt_mask,
                memory_key_padding_mask=memory_key_padding_mask
            )
        return self.out_proj(out)

    def forward(
        self,
        x,
        frames_padding_mask,
    ):
        encoder_out = self.encode(x, frames_padding_mask)

        B = x.size(0)
        q = self.query_embed.unsqueeze(0).expand(B, -1, -1)
        embeddings = self.decode(encoder_out, q, frames_padding_mask)
        return embeddings
