import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { swissCantons, companySizes, industries } from '@/data/questionsData';
import { User, Building2, Mail, MapPin, Users, Briefcase, ArrowRight, Shield, ChevronDown } from 'lucide-react';

export const LeadCaptureForm = ({ onSubmit, isLoading, score }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    companySize: '',
    industry: '',
    canton: '',
    consentMarketing: false,
  });

  const [errors, setErrors] = useState({});
  const [showOptional, setShowOptional] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Prénom requis';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.consentMarketing) {
      newErrors.consentMarketing = 'Vous devez accepter pour recevoir vos résultats';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-xl mx-auto"
    >
      <Card className="border-2 border-border shadow-elegant">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl md:text-2xl font-display">
            Recevez votre score et vos 3 priorités
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Entrez vos coordonnées pour recevoir votre rapport personnalisé par email.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Required Fields */}
            <div className="space-y-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Prénom <span className="text-danger">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Jean"
                  className={errors.firstName ? 'border-danger' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-danger">{errors.firstName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email professionnel <span className="text-danger">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="jean.dupont@entreprise.ch"
                  className={errors.email ? 'border-danger' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-danger">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Optional Fields - Collapsible */}
            <Collapsible open={showOptional} onOpenChange={setShowOptional}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-between text-muted-foreground hover:text-foreground"
                >
                  <span className="text-sm">Informations complémentaires (optionnel)</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showOptional ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Nom
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Dupont"
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    Nom de l'entreprise
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder="Cabinet Médical Lausanne SA"
                  />
                </div>

                {/* Company Size & Industry */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      Taille
                    </Label>
                    <Select
                      value={formData.companySize}
                      onValueChange={(value) => handleChange('companySize', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      Secteur
                    </Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => handleChange('industry', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind) => (
                          <SelectItem key={ind.value} value={ind.value}>
                            {ind.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Canton */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Canton
                  </Label>
                  <Select
                    value={formData.canton}
                    onValueChange={(value) => handleChange('canton', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner votre canton" />
                    </SelectTrigger>
                    <SelectContent>
                      {swissCantons.map((canton) => (
                        <SelectItem key={canton.value} value={canton.value}>
                          {canton.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Consent */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={formData.consentMarketing}
                  onCheckedChange={(checked) => handleChange('consentMarketing', checked)}
                  className={errors.consentMarketing ? 'border-danger' : ''}
                />
                <div className="flex-1">
                  <Label 
                    htmlFor="consent" 
                    className="text-sm font-normal cursor-pointer"
                  >
                    J'accepte de recevoir mes résultats et des recommandations pour 
                    sécuriser ma conformité nLPD. <span className="text-danger">*</span>
                  </Label>
                  {errors.consentMarketing && (
                    <p className="text-sm text-danger mt-1">{errors.consentMarketing}</p>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Vos données sont traitées conformément à notre politique de confidentialité 
                et ne seront jamais partagées avec des tiers.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="premium"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  Recevoir mon rapport
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Gratuit • Sans engagement • Résultats immédiats
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LeadCaptureForm;
