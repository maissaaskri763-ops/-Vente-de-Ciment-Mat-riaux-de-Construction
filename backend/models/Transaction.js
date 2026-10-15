import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  num_liv: { type: String, required: true, index: true },
  date_liv: { type: String, required: true, index: true },
  cod_cli: { type: String, index: true },
  nom_cli: { type: String, required: true, index: true },
  qte_liv: { type: Number, required: true },
  cod_art: { type: String },
  abrv_art: { type: String, required: true, index: true },
  lib_gouv: { type: String, required: true, index: true },
  typ_regl: { type: String, required: true, enum: ['COMPTANT', 'CREDIT', 'CHEQUE', 'TRAITE', 'UNKNOWN'] },
  mnt_ttc: { type: Number, required: true }
}, {
  timestamps: true
});

export default mongoose.model('Transaction', transactionSchema);
